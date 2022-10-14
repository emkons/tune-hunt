import React, { createContext, useContext, useEffect, useState } from "react"
import SpotifyWebApi from 'spotify-web-api-js'
import Cookies from 'js-cookie'
import { useNavigate } from "react-router-dom"
import { useFirebase } from "./FirebaseContext"

const SpotifyContext = createContext()

export const useSpotify = () => useContext(SpotifyContext)

export const SpotifyProvider = ({children}) => {
    const { spotifyToken, refreshToken } = useFirebase()
    const [apiInstance, setApiInstance] = useState(null)

    useEffect(() => {
        if (spotifyToken) {
            const instance = new SpotifyWebApi()
            setApiInstance(instance)
            instance.setAccessToken(spotifyToken)
            // console.log('Setting token', spotifyToken)
        } else {
            setApiInstance(null)
        }
    }, [spotifyToken])

    /**
     * 
     * @param {XMLHttpRequest} request 
     */
    const errorHandler = (request) => {
        if (request.status === 401) {
            const responseBody = JSON.parse(request.responseText)
            // console.log(responseBody)
            if (responseBody?.error?.message === 'The access token expired') {
                refreshToken()
            }
        }
    }

    const value = {
        apiInstance,
        errorHandler
    }

    return (
        <SpotifyContext.Provider value={value}>
            {children}
        </SpotifyContext.Provider>
    )
}