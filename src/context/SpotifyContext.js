import React, { createContext, useContext, useEffect, useState } from "react"
import SpotifyWebApi from 'spotify-web-api-js'
import Cookies from 'js-cookie'

const SpotifyContext = createContext()

export const useSpotify = () => useContext(SpotifyContext)

export const SpotifyProvider = ({children}) => {
    const [apiInstance, setApiInstance] = useState(null)
    const [token, setToken] = useState(Cookies.get("spotifyAuthToken"))

    useEffect(() => {
        const instance = new SpotifyWebApi()
        setApiInstance(instance)
        instance.setAccessToken(token)
    }, [token])

    const value = {
        token,
        setToken,
        apiInstance
    }

    return (
        <SpotifyContext.Provider value={value}>
            {children}
        </SpotifyContext.Provider>
    )
}