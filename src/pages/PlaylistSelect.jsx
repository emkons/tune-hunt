import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Content from '../components/Content'
import { parse } from 'spotify-uri'
import PlaylistInfo from '../components/PlaylistInfo'

const PlaylistSelect = () => {
    const navigate = useNavigate()
    const [link, setLink] = useState('')
    const [error, setError] = useState('')

    const onTextChange = (event) => {
        setLink(event.target.value)
        setError('')
    }

    const goToPlaylist = () => {
        const parsed = parse(link)
        if (!parsed?.type) {
            setError('Invalid URL')
            return
        }
        if (parsed?.type !== 'playlist') {
            setError('Only playlist links supported')            
            return
        }
        console.log(parsed)
        navigate(`/playlist/${parsed?.id}`)
    }

    return (
        <Content>
            <div className="container mx-auto px-4 py-14 sm:px-6 xl:px-12">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <h1 className="text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">Select Playlist</h1>
                    <p className="max-w-screen-sm text-lg text-gray-600 sm:text-2xl">Paste url of a spotify playlist below to get started</p>
                    <form className="flex w-full max-w-md flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                        <input type="text" className="w-full rounded-md border bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Spotify URL" value={link} onChange={onTextChange} />
                        <div>{error}</div>
                        <button type="submit" className="w-full rounded-md border border-blue-500 bg-blue-500 py-2 px-6 text-white transition hover:border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-blue-500 disabled:hover:bg-blue-500 sm:max-w-max" onClick={() => goToPlaylist()}>Go</button>
                    </form>
                    <p className="max-w-screen-sm text-lg text-gray-600 sm:text-2xl">or</p>
                    <p className="max-w-screen-sm text-lg text-gray-600 sm:text-2xl">Choose one from the list below</p>
                    <PlaylistInfo
                        name="All Out 80s"
                        author="Spotify"
                        thumbnail="https://i.scdn.co/image/ab67706f00000003e6ed19ecc791fce2ec58d005"
                        link="/playlist/37i9dQZF1DX4UtSsGT1Sbe"
                    />
                    <PlaylistInfo
                        name="All Out 90s"
                        author="Spotify"
                        thumbnail="https://i.scdn.co/image/ab67706f0000000379c2dd164d3c1a831a8a3a1e"
                        link="/playlist/37i9dQZF1DXbTxeAdrVG2l"
                    />
                </div>
            </div>
        </Content>
    )
}

export default PlaylistSelect

