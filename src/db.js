import Dexie from 'dexie';

export const db = new Dexie('myDatabase');

db.version(8).stores({
    playlistHistory: '[id+date], id, date', // Primary key and indexed props
    settings: 'key',
    favourites: 'id, position',
    tracks: '[key+playlist], playlist, key',
});
