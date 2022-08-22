import Dexie from 'dexie';

export const db = new Dexie('myDatabase');

db.version(9).stores({
    playlistHistory: '[id+date], id, date', // Primary key and indexed props
    playlist: 'id',
    settings: 'key',
    favourites: 'id, position',
    tracks: '[key+playlist], playlist, key',
});
