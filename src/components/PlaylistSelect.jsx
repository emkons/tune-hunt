import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PlaylistSelect = () => {
    const navigate = useNavigate()
    const [link, setLink] = useState('')

    const goToPlaylist = () => {
        navigate(`/playlist/${link}`)
    }

    return (
        <>
            <div>Playlist Select</div>
            <input type="text" value={link} onChange={(event) => setLink(event.target.value)} />
            <input type="submit" value="Go" onClick={() => goToPlaylist()} />
        </>
    )
}

export default PlaylistSelect

