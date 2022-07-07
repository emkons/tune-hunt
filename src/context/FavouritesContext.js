import { useLiveQuery } from "dexie-react-hooks"
import React, { createContext, useContext } from "react"
import { db } from "../db"

const FavouritesContext = createContext()

export const useFavourites = () => useContext(FavouritesContext)

export const FavouritesProvider = ({children}) => {
    const favourites = useLiveQuery(() => db.favourites.orderBy('position').toArray(), [], [])

    const addFavourite = (favourite) => {
        db.favourites.put({...favourite, position: favourites.length})
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