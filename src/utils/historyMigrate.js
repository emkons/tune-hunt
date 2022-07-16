import { db } from "../db"

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
