import React, { createContext, useContext, useEffect, useState } from "react"
import SpotifyWebApi from 'spotify-web-api-js'
import Cookies from 'js-cookie'
import { useNavigate } from "react-router-dom"

const SpotifyContext = createContext()

export const useSpotify = () => useContext(SpotifyContext)

export const SpotifyProvider = ({children}) => {
    const navigate = useNavigate()
    const [apiInstance, setApiInstance] = useState(null)
    const [token, setToken] = useState(Cookies.get("spotifyAuthToken"))
    
    const removeToken = () => {
        setToken(null)
        navigate('/')
    }

    useEffect(() => {
        const instance = new SpotifyWebApi()
        setApiInstance(instance)
        instance.setAccessToken(token)
    }, [token])

    const value = {
        token,
        setToken,
        apiInstance,
        removeToken,
    }

    return (
        <SpotifyContext.Provider value={value}>
            {children}
        </SpotifyContext.Provider>
    )
}