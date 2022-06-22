import React from 'react'
import { Link } from 'react-router-dom'
import VolumeSlider from './VolumeSlider'

const Header = ({volume, setVolume}) => {
    return (
        <section className="w-full px-8 text-gray-700 bg-white">
            <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl">
                <div className="relative flex flex-col md:flex-row">
                    <Link to={'/'} className="flex items-center mb-5 font-medium text-gray-900 lg:w-auto lg:items-center lg:justify-center md:mb-0">
                        <span className="mx-auto text-xl font-black leading-none text-gray-900 select-none">Spotify Heardle<span className="text-indigo-600">.</span></span>
                    </Link>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <Link to={'/search'} className="font-medium text-gray-900">Search</Link>
                    <VolumeSlider value={volume} setValue={setVolume} />
                </div>

                {/* <div className="inline-flex items-center ml-5 space-x-6 lg:justify-end">
                    <a href="#" className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                        Log into Spotify
                    </a>
                </div> */}
            </div>
        </section>
    )
}

export default Header