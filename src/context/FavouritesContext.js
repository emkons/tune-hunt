import { useLiveQuery } from "dexie-react-hooks"
import React, { createContext, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../db"

const FavouritesContext = createContext()

export const useFavourites = () => useContext(FavouritesContext)

export const FavouritesProvider = ({children}) => {
    const navigate = useNavigate()
    const favourites = useLiveQuery(() => db.favourites.toArray(), [])

    const addFavourite = (favourite) => {
        db.favourites.put(favourite)
    }

    const removeFavourite = (favourite) => {
        db.favourites.delete(favourite.id)
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