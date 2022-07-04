import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpotifyAuth } from 'react-spotify-auth'
import Content from '../components/Content'
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
        <Content>
            <div className="container mx-auto px-4 py-14 sm:px-6 xl:px-12">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <h1 className="text-4xl font-bold tracking-normal dark:text-gray-300 sm:text-5xl lg:text-6xl">Spotify Heardle</h1>
                    <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">Select playlist, listen to part of the preview and try to guess which of the songs it is.</p>
                    <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">To get started, click the below button to log into spotify</p>
                    <div className="w-48 dark:text-gray-300">
                        <SpotifyAuth
                            redirectUri={process.env.REACT_APP_SPOTIFY_REDIRECT_URL}
                            clientID={process.env.REACT_APP_SPOTIFY_CLIENT_ID}
                            logoClassName="fill-green-500"
                            onAccessToken={handleAccess}
                        />
                    </div>
                </div>
            </div>
        </Content>
    )
}

export default Login
