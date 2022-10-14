import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useEffect } from 'react'
import { useFirebase } from '../context/FirebaseContext';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../db';

const useGameData = (playlistId, date) => {
    const {user, session} = useFirebase()
    const [guesses, setGuesses] = useState([])
    const [finished, setFinished] = useState()
    const [correct, setCorrect] = useState()
    const [todayTrack, setTodayTrack] = useState()
    const [todayTrackIndex, setTodayTrackIndex] = useState()
    const [snapshotId, setSnapshotId] = useState()
    const [loading, setLoading] = useState(false)
    const [saveTrigger, setSaveTrigger] = useState()

    useEffect(() => {
        if (user && playlistId && date) {
            setLoading(true)
            fetchSessionData()
        }
    }, [user, session, playlistId, date])

    useEffect(() => {
        if (saveTrigger) {
            const historyRef = doc(getFirestore(), `/sessions/${session}/history/${playlistId}-${date}`)
            setDoc(historyRef, {
                playlistId,
                date,
                guesses,
                finished,
                correct,
                todayTrack,
                todayTrackIndex,
                snapshotId
            }, {merge: true})
        }
    }, [saveTrigger])

    const fetchSessionData = async () => {
        const historyRef = doc(getFirestore(), `/sessions/${session}/history/${playlistId}-${date}`)
        const historyVal = await getDoc(historyRef)
        if (historyVal.exists()) {
            const historyData = historyVal.data()
            console.log(historyData)
            setCorrect(historyData.correct)
            setGuesses(historyData.guesses || [])
            setFinished(historyData.finished)
            setTodayTrack(historyData.todayTrack)
            setTodayTrackIndex(historyData.todayTrackIndex)
            setSnapshotId(historyData.snapshotId)
        } else {
            setCorrect(false)
            setGuesses([])
            setFinished(false)
            setTodayTrack({})
            setTodayTrackIndex(null)
            setSnapshotId(null)
        }
        setLoading(false)
    }

    const save = async () => {
        setSaveTrigger(Math.random())
    }

    return {
        todayTrack, setTodayTrack,
        todayTrackIndex, setTodayTrackIndex,
        guesses, setGuesses,
        correct, setCorrect,
        finished, setFinished,
        snapshotId, setSnapshotId,
        historyLoading: loading,
        save
    };
}

export default useGameData
