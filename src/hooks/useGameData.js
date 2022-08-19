import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect, useMemo } from 'react'
import { db } from '../db';
import useLocalStorage from './useLocalStorage';

const useGameData = (playlistId, date) => {
    const historyData = useLiveQuery(() => db.playlistHistory.get({id: playlistId, date: date}), [playlistId, date], 'loading')
    const playlistData = useLiveQuery(() => db.playlist.get({id: playlistId}), [playlistId], 'loading')
    const guesses = useMemo(() => historyData?.guesses || [], [historyData])
    const finished = useMemo(() => historyData?.finished || false, [historyData])
    const correct = useMemo(() => historyData?.correct || false, [historyData])
    const todayTrack = useMemo(() => historyData?.todayTrack || null, [historyData])
    const todayTrackIndex = useMemo(() => historyData?.todayTrackIndex === undefined ? null : historyData?.todayTrackIndex, [historyData])
    const snapshotId = useMemo(() =>  playlistData?.snapshotId || null, [playlistData])
    const latestSnapshotId = useMemo(() =>  playlistData?.latestSnapshotId || null, [playlistData])
    const playlistLoading = useMemo(() => {
        return playlistData === 'loading' || (playlistData !== undefined && playlistData.id !== playlistId)
    }, [playlistData, playlistId])
    const historyLoading = useMemo(() => {
        return historyData === 'loading' || (historyData !== undefined && historyData.id !== playlistId)
    }, [historyData, playlistId])

    const updateValue = async (newValue) => {
        if (historyData === undefined) {
            db.playlistHistory.put({
                id: playlistId,
                date: date,
                ...historyData,
                ...newValue
            })
        } else {
            db.playlistHistory.update({
                id: playlistId,
                date: date
            }, newValue)
        }
    }

    const updatePlaylistValue = async (newValue) => {
        if (playlistData === undefined) {
            db.playlist.put({
                id: playlistId,
                ...playlistData,
                ...newValue
            })
        } else {
            db.playlist.update({
                id: playlistId
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

    const setSnapshotId = async (newSnapshotId) => {
        return updatePlaylistValue({snapshotId: newSnapshotId})
    }

    const setLatestnapshotId = async (newLatestSnapshotId) => {
        return updatePlaylistValue({latestSnapshotId: newLatestSnapshotId})
    }

    return {
        todayTrack, setTodayTrack,
        todayTrackIndex, setTodayTrackIndex,
        guesses, setGuesses,
        correct, setCorrect,
        finished, setFinished,
        snapshotId, setSnapshotId,
        latestSnapshotId, setLatestnapshotId,
        historyLoading, historyData,
        playlistLoading, updatePlaylistValue,
        updateValue
    };
}

export default useGameData
