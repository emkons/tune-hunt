import React, { useState, useEffect, useRef } from 'react'
import useLocalStorage from './useLocalStorage';

const useGameData = (playlistId, date) => {
    const [todayTrack, setTodayTrack] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [correct, setCorrect] = useState(false);
    const [finished, setFinished] = useState(false);

    const [playlistData, setPlaylistData] = useLocalStorage(`history-${playlistId}`, {})

    useEffect(() => {
        if (playlistId === undefined || date === undefined || playlistData === null || Object.keys(playlistData).length === 0) {
            return
        }

        if (playlistData?.[date] === undefined) {
            setTodayTrack(null)
            setGuesses([])
            setCorrect(false)
            setFinished(false)
        } else {
            const data = playlistData?.[date]
            if (data?.guesses.length === guesses.length && data?.correct === correct && data?.finished === finished) {
                return
            }
            setTodayTrack(data?.track)
            setGuesses(data?.guesses)
            setCorrect(data?.correct)
            setFinished(data?.finished)
        }
    }, [playlistData]);

    useEffect(() => {
        if (!todayTrack || Object.keys(todayTrack).length === 0) {
            return
        }

        setPlaylistData({
            ...playlistData,
            [date]: {
                track: todayTrack,
                guesses,
                correct,
                finished
            }
        })
    }, [todayTrack, guesses, correct, finished])

    return {
        todayTrack, setTodayTrack,
        guesses, setGuesses,
        correct, setCorrect,
        finished, setFinished
    };
}

export default useGameData
