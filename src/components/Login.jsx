import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpotifyAuth } from 'react-spotify-auth'
import { useSpotify } from '../context/SpotifyContext'

const Login = () => {
    const { setToken, token } = useSpotify()
    const navigate = useNavigate()

    const handleAccess = (t) => {
        setToken(t)
        if (token) {
            navigate('/playlist')
        }
    }

    useEffect(() => {
        if (token) {
            navigate('/playlist')
        }
    }, [navigate, token])

    return (
        <div>
            <SpotifyAuth
                redirectUri={process.env.REACT_APP_SPOTIFY_REDIRECT_URL}
                clientID={process.env.REACT_APP_SPOTIFY_CLIENT_ID}
                onAccessToken={handleAccess}
            />
        </div>
    )
}

export default Login
