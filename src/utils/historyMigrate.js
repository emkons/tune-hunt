import { doc, getFirestore, setDoc } from "firebase/firestore"
import { db } from "../db"
import { toast } from 'react-toastify';

export const migrate = () => {
    let migrated = localStorage.getItem('migrated')
    if (migrated === 'true') {
        migrated = '1'
    }
    
    if (migrated < '1') {
        migrateV1()
        localStorage.setItem('migrated', '1')
    }
    
    if (migrated < '2') {
        migrateV2()
        localStorage.setItem('migrated', '2')
    }

    if (migrated < '3') {
        migrateV3()
        localStorage.setItem('migrated', '3')
    }
}

const migrateV1 = () => {
    console.log("Migrating history to indexed DB")
    
    Object.keys(localStorage).forEach(key => {
        if (!key.startsWith('history-')) {
            return
        }

        const playlistId = key.substring(8)
        const value = JSON.parse(localStorage.getItem(key))
        if (value) {
            Object.keys(value).forEach(date => {
                const dayData = value[date]
                db.playlistHistory.put({
                    id: playlistId,
                    date: date,
                    ...dayData
                })
            })
        }
        localStorage.removeItem(key)
    })
}

const migrateV2 = () => {
    console.log("Migrating favourites to indexed DB")
    
    const favouritesRaw = localStorage.getItem('favourites')
    const favourites = JSON.parse(favouritesRaw || '[]')
    favourites.forEach(fav => {
        db.favourites.put(fav)
        localStorage.removeItem('favourites')
    })
}

const migrateV3 = async () => {
    console.log("Migrating favourites order in indexed DB")

    const favourites = await db.favourites.toArray()
    const orderedList = favourites.map((fav, index) => ({position: index, ...fav}))
    db.favourites.bulkPut(orderedList)
}

export const migrateToFirebase = async (updateFavourites, session) => {
    const toastId = toast('Migrating. Do not refresh the page.', {progress: 0, autoClose: false, closeButton: false})
    const localFavs = await db.favourites.orderBy('position').toArray()
    updateFavourites(localFavs)
    
    const localHistory = await db.playlistHistory.toArray()
    console.log(localHistory)
    const recordCount = localHistory?.length || 0
    let uploadedCount = 0
    const updateStatus = () => {
        uploadedCount++;
        toast.update(toastId, {progress: uploadedCount / recordCount})
        if (uploadedCount === recordCount) {
            toast.done(toastId)
            toast('Migration finished.')
        }
    }
    localHistory.forEach(async (h, index) => {
        if (!h.finished) {
            updateStatus()
            return;
        }
        const historyRef = doc(getFirestore(), `/sessions/${session}/history/${h.id}-${h.date}`)
        await setDoc(historyRef, {
            playlistId: h.id,
            date: h.date,
            guesses: h.guesses || [],
            finished: h.finished || false,
            correct: h.correct || false,
            todayTrack: h.todayTrack || {},
            todayTrackIndex: h.todayTrackIndex || 0,
            snapshotId: h.snapshotId || 0
        }, {merge: true})
        updateStatus()
    })
}
