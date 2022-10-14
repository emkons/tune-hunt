import { useLiveQuery } from "dexie-react-hooks"
import { doc, getFirestore, setDoc } from "firebase/firestore"
import React, { createContext, useContext, useEffect, useState } from "react"
import { db } from "../db"
import { useFirebase } from "./FirebaseContext"

const FavouritesContext = createContext()

export const useFavourites = () => useContext(FavouritesContext)

export const FavouritesProvider = ({children}) => {
    const {session, sessionData} = useFirebase()
    const [favourites, setFavourites] = useState([])

    useEffect(() => {
        if (sessionData) {
            setFavourites(sessionData.favourites || [])
        } else {
            setFavourites([])
        }
    }, [sessionData])

    const updateFavourites = (newFavourites) => {
        storeFavourites(newFavourites)
        setFavourites(newFavourites)
    }

    const storeFavourites = (newFavourites) => {
        const sessionRef = doc(getFirestore(), `/sessions/${session}`)
        setDoc(sessionRef, {
            favourites: newFavourites
        }, {merge: true})
    }

    const addFavourite = (favourite) => {
        updateFavourites([...favourites, {...favourite, position: favourites.length}])
    }

    const removeFavourite = (favourite) => {
        const newFavourites = favourites.filter(f => f.id !== favourite.id)
        updateFavourites(newFavourites)
    }

    const value = {
        favourites,
        addFavourite,
        removeFavourite,
        updateFavourites
    }

    return (
        <FavouritesContext.Provider value={value}>
            {children}
        </FavouritesContext.Provider>
    )
}