/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const functions = require('firebase-functions');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });

// Firebase Setup
const admin = require('firebase-admin');
// @ts-ignore
const serviceAccount = require('./service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //  databaseURL: `https://${process.env.GCLOUD_PROJECT}.europe-west3.firebaseio.com`,
});

// Spotify OAuth 2 setup
// TODO: Configure the `spotify.client_id` and `spotify.client_secret` Google Cloud environment variables.
const SpotifyWebApi = require('spotify-web-api-node');
const Spotify = new SpotifyWebApi({
  clientId: functions.config().spotify.client_id,
  clientSecret: functions.config().spotify.client_secret,
  redirectUri: functions.config().spotify.redirect_uri,
});

// Scopes to request.
const OAUTH_SCOPES = ['user-read-email'];

/**
 * Redirects the User to the Spotify authentication consent screen. Also the 'state' cookie is set for later state
 * verification.
 */
exports.redirect = functions.region('europe-west3').https.onRequest((req, res) => {
  cors(req, res, () => {
    cookieParser()(req, res, () => {
      const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
      functions.logger.log('Setting verification state:', state);
      res.cookie('state', state.toString(), { maxAge: 3600000, secure: true, httpOnly: true });
      const authorizeURL = Spotify.createAuthorizeURL(OAUTH_SCOPES, state.toString());
      res.redirect(authorizeURL);
    });
  })
});

/**
 * Exchanges a given Spotify auth code passed in the 'code' URL query parameter for a Firebase auth token.
 * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie.
 * The Firebase custom auth token is sent back in a JSONP callback function with function name defined by the
 * 'callback' query parameter.
 */
exports.token = functions.region('europe-west3').https.onRequest((req, res) => {
  cors(req, res, () => {
    try {
      cookieParser()(req, res, () => {
        functions.logger.log('Received verification state:', req.cookies.state);
        functions.logger.log('Received state:', req.query.state);
        functions.logger.log('Request state:', functions.config().spotify.client_id, functions.config().spotify.client_secret, functions.config().spotify.redirect_uri, req.query.code);
        req.cookies.state = req.query.state
        // if (!req.cookies.state) {
        //   throw new Error('State cookie not set or expired. Maybe you took too long to authorize. Please try again.');
        // } else if (req.cookies.state !== req.query.state) {
        //   throw new Error('State validation failed');
        // }
        functions.logger.log('Received auth code:', req.query.code);
        Spotify.authorizationCodeGrant(req.query.code, (error, data) => {
          if (error) {
            functions.logger.log(
              'Spotify auth issue',
              error.message
            );
            throw error;
          }
          functions.logger.log(
            'Received Access Token:',
            data.body['access_token']
          );
          Spotify.setAccessToken(data.body['access_token']);

          Spotify.getMe(async (error, userResults) => {
            if (error) {
              throw error;
            }
            functions.logger.log(
              'Auth code exchange result received:',
              userResults
            );
            // We have a Spotify access token and the user identity now.
            const tokenData = data.body;
            const spotifyUserID = userResults.body['id'];
            const profilePic = userResults.body['images'][0]['url'];
            const userName = userResults.body['display_name'];
            const email = userResults.body['email'];

            // Create a Firebase account and get the Custom Auth Token.
            const firebaseToken = await createFirebaseAccount(spotifyUserID, userName, profilePic, email, tokenData);
            // Serve an HTML page that signs the user in and updates the user profile.
            res.json({ token: firebaseToken });
          });
        });
      });
    } catch (error) {
      res.json({ error: error.toString() });
    }
    return null;
  })
});

exports.refresh = functions.region('europe-west3').https.onRequest((req, res) => {
  cors(req, res, () => {
    validateFirebaseIdToken(req, res, async () => {
      const { uid } = req.user
      const userTokenData = await admin.firestore().doc(`/spotifyAccessToken/${uid}`).get();
      functions.logger.log(
        'Existing user token data fetched',
        userTokenData
      );
      if (!userTokenData.exists) {
        res.status(403).send('Unauthorized');
        return;
      }
      Spotify.setRefreshToken(userTokenData.data().refresh_token);
      Spotify.refreshAccessToken(async (error, refreshResult) => {
        if (error) {
          throw error;
        }
        functions.logger.log(
          'Token refresh data received:',
          refreshResult.body
        );
        await userTokenUpdate(uid, refreshResult.body)
        res.json(refreshResult.body);
      })
    })
  })
})

/**
 * Checks if the request has firebase auth token attached in headers
 */
const validateFirebaseIdToken = async (req, res, next) => {
  functions.logger.log('Check if request is authorized with Firebase ID token');

  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    functions.logger.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
    );
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    functions.logger.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    functions.logger.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    functions.logger.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  }
};

/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * Also saves the accessToken to the datastore at /spotifyAccessToken/$uid
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
async function createFirebaseAccount(spotifyID, displayName, photoURL, email, tokenData) {
  // The UID we'll assign to the user.
  const uid = `spotify:${spotifyID}`;

  // Save the access token to the Firebase Realtime Database.
  const databaseTask = admin.firestore().doc(`/spotifyAccessToken/${uid}`).set({ ...tokenData });

  // Create session for user
  const sessionCreateTask = admin.firestore().doc(`/sessions/${uid}`).set({ displayName, admin: uid, members: [uid] }, { merge: true });

  // Create or update the user account.
  const userCreationTask = admin.auth().updateUser(uid, {
    displayName: displayName,
    photoURL: photoURL,
    email: email,
    emailVerified: true,
  }).catch((error) => {
    // If user does not exists we create it.
    if (error.code === 'auth/user-not-found') {
      return admin.auth().createUser({
        uid: uid,
        displayName: displayName,
        photoURL: photoURL,
        email: email,
        emailVerified: true,
      });
    }
    throw error;
  });

  // Wait for all async tasks to complete, then generate and return a custom auth token.
  await Promise.all([userCreationTask, databaseTask, sessionCreateTask]);
  // Create a Firebase custom auth token.
  const token = await admin.auth().createCustomToken(uid);
  functions.logger.log(
    'Created Custom token for UID "',
    uid,
    '" Token:',
    token
  );
  return token;
}

async function userTokenUpdate(uid, tokenData) {
  // Save the access token to the Firebase Realtime Database.
  const databaseTask = admin.firestore().doc(`/spotifyAccessToken/${uid}`).set({ ...tokenData });

  // Wait for all async tasks to complete, then generate and return a custom auth token.
  await databaseTask;
  return true;
}
