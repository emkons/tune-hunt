import React, { createContext, useContext } from "react"
import { useNavigate } from "react-router-dom"
import useLocalStorage from "../hooks/useLocalStorage"

const FavouritesContext = createContext()

export const useFavourites = () => useContext(FavouritesContext)

export const FavouritesProvider = ({children}) => {
    const navigate = useNavigate()
    const [favourites, setFavourites] = useLocalStorage('favourites', [])

    const addFavourite = (favourite) => {
        setFavourites([...(favourites || []), favourite])
    }

    const removeFavourite = (favourite) => {
        setFavourites((favourites || []).filter(fav => fav?.id !== favourite?.id))
    }

    const value = {
        favourites,
        addFavourite,
        removeFavourite
    }

    return (
        <FavouritesContext.Provider value={value}>
            {children}
        </FavouritesContext.Provider>
    )
}