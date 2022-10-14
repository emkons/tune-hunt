import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "../config/firebase.js";
import { db } from "../db.js";
import useLocalStorage from "../hooks/useLocalStorage.js";

export const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext)

export const FirebaseProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  // const [session, setSession] = useState(null)
  const [session, setInternalSession] = useState(null)
  const [userSessions, setUserSessions] = useState([])
  const [sessionData, setSessionData] = useState(null)
  const [spotifyToken, setSpotifyToken] = useState(null)

  const fetchAccessToken = async (uid) => {
    const tokenDocRef = doc(getFirestore(), `/spotifyAccessToken/${uid}`)
    const tokenDoc = await getDoc(tokenDocRef)
    setSpotifyToken(tokenDoc.data().access_token)
  }

  const setSession = (newSession) => {
    setInternalSession(newSession)
    localStorage.setItem('session', newSession)
  }

  const fetchUserSessions = async (uid) => {
    const sessionsRef = collection(getFirestore(), `sessions`)
    const sessionsQuery = query(sessionsRef, where("members", 'array-contains', uid))
    const sessionDocs = await getDocs(sessionsQuery)
    if (sessionDocs.empty) {
      setUserSessions([])
    } else {
      setUserSessions(sessionDocs.docs.map(s => ({id: s.id, ...s.data()})))
    }
  }

  const refreshToken = async () => {
    fetch(`${process.env.REACT_APP_AUTH_BASE_URL}refresh`, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`
      }
    })
      .then(res => {
        console.log(res)
        return res.json()
      })
      .then(res => {
        setSpotifyToken(res.access_token)
      })
  }

  useEffect(() => {
    auth().onAuthStateChanged((user) => {
      setUser(user)
      const previousSession = localStorage.getItem('session')
      if (!previousSession || previousSession === 'null') {
        setSession(user?.uid)
      } else {
        setSession(previousSession)
      }
      if (user) {
        fetchUserSessions(user.uid)
        fetchAccessToken(user.uid)
      } else {
        setUserSessions([])
        setSpotifyToken(null)
      }
    });
  }, []);

  useEffect(() => {
    if (session && user && userSessions?.length) {
      const sessionD = userSessions.find(s => s.id === session)
      setSessionData(sessionD)
    }
  }, [userSessions, user, session]);

  return (
    <FirebaseContext.Provider value={{ user, session, setSession, spotifyToken, refreshToken, sessionData, userSessions }}>{children}</FirebaseContext.Provider>
  );
};
