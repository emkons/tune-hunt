import { db } from "../db"

export const migrate = () => {
    const migrated = localStorage.getItem('migrated')
    if (migrated) {
        return
    }
    console.log("Migrating to indexed DB")
    
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
    localStorage.setItem('migrated', true)
}