import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect, useMemo } from 'react'
import { db } from '../db';
import useLocalStorage from './useLocalStorage';

const useGameData = (playlistId, date) => {
    const playlistData = useLiveQuery(() => db.playlistHistory.get({id: playlistId, date: date}), [playlistId, date], 'loading')
    const guesses = useMemo(() => playlistData?.guesses || [], [playlistData])
    const finished = useMemo(() => playlistData?.finished || false, [playlistData])
    const correct = useMemo(() => playlistData?.correct || false, [playlistData])
    const todayTrack = useMemo(() => playlistData?.todayTrack || null, [playlistData])
    const todayTrackIndex = useMemo(() => playlistData?.todayTrackIndex || null, [playlistData])
    const loading = playlistData === 'loading'

    const updateValue = async (newValue) => {
        if (playlistData === undefined) {
            db.playlistHistory.put({
                id: playlistId,
                date: date,
                ...playlistData,
                ...newValue
            })
        } else {
            db.playlistHistory.update({
                id: playlistId,
                date: date
            }, newValue)
        }
    }

    const setGuesses = async (newGuesses) => {
        return updateValue({guesses: newGuesses})
    }

    const setCorrect = async (newCorrect) => {
        return updateValue({correct: newCorrect})
    }

    const setFinished = async (newFinished) => {
        return updateValue({finished: newFinished})
    }

    const setTodayTrack = async (newTodayTrack) => {
        return updateValue({todayTrack: newTodayTrack})
    }

    const setTodayTrackIndex = async (newTodayTrackIndex) => {
        return updateValue({todayTrackIndex: newTodayTrackIndex})
    }

    return {
        todayTrack, setTodayTrack,
        todayTrackIndex, setTodayTrackIndex,
        guesses, setGuesses,
        correct, setCorrect,
        finished, setFinished,
        historyLoading: loading
    };
}

export default useGameData
