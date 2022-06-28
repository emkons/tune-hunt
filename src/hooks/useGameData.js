import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect } from 'react'
import { db } from '../db';
import useLocalStorage from './useLocalStorage';

const useGameData = (playlistId, date) => {
    const [todayTrack, setTodayTrack] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [correct, setCorrect] = useState(false);
    const [finished, setFinished] = useState(false);

    const playlistData = useLiveQuery(() => db.playlistHistory.get({id: playlistId, date: date}), [playlistId, date])

    useEffect(() => {
        if (playlistData === undefined) {
            setTodayTrack(null)
            setGuesses([])
            setCorrect(false)
            setFinished(false)
        } else {
            if (playlistData?.guesses.length === guesses.length && playlistData?.correct === correct && playlistData?.finished === finished) {
                return
            }
            setTodayTrack(playlistData?.track)
            setGuesses(playlistData?.guesses)
            setCorrect(playlistData?.correct)
            setFinished(playlistData?.finished)
        }
        // eslint-disable-next-line
    }, [playlistData]);

    useEffect(() => {
        if (!todayTrack || Object.keys(todayTrack).length === 0) {
            return
        }

        db.playlistHistory.put({
            id: playlistId,
            date: date,
            track: todayTrack,
            guesses,
            correct,
            finished
        })

        // eslint-disable-next-line
    }, [todayTrack, guesses, correct, finished])

    return {
        todayTrack, setTodayTrack,
        guesses, setGuesses,
        correct, setCorrect,
        finished, setFinished
    };
}

export default useGameData
