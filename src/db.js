import Dexie from 'dexie';

export const db = new Dexie('myDatabase');

db.version(3).stores({
    playlistHistory: '[id+date], id, date', // Primary key and indexed props
});
