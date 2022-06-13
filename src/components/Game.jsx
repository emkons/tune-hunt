import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSpotify } from '../context/SpotifyContext'

const Game = () => {
    const { playlistId } = useParams()
    const { apiInstance } = useSpotify()
    const [tracks, setTracks] = useState([])
    const [playlistImage, setPlaylistImage] = useState('')
    const [playlistName, setPlaylistName] = useState('')
    const [playlistAuthor, setPlaylistAuthor] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiInstance?.getPlaylist(playlistId, {
            market: 'LV',
            fields: 'tracks.items(track.name,track.preview_url),name,owner.display_name,images'
        }).then(data => {
            console.log(data)
            setPlaylistImage(data.images?.[0]?.url)
            setPlaylistAuthor(data.owner.display_name)
            setPlaylistName(data.name)
            setLoading(false)
        })
    }, [apiInstance, playlistId])

    return (
        <>
        {loading ? <div>Loading...</div> : (
            <>
                <div>Game {playlistId}</div>
                <div>{playlistName} by {playlistAuthor}</div>
            </>
        )}
        </>
    )
}

export default Game
