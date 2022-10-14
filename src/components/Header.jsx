import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFirebase } from '../context/FirebaseContext'
import { auth } from '../config/firebase'
import VolumeSlider from './VolumeSlider'
import Dropdown from './Dropdown'

const Header = ({volume, setVolume}) => {
    const { user, session, setSession, userSessions } = useFirebase()
    const navigate = useNavigate()

    const logout = async () => {
        if (user) {
            await auth().signOut()
            navigate('/')
        }
    }

    const handleSessionChange = (newSession) => {
        setSession(newSession)
    }

    return (
        <section className="w-full px-8 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 z-20">
            <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl">
                <div className="relative flex flex-col md:flex-row">
                    <Link to={'/'} className="flex items-center mb-5 font-medium text-gray-900 dark:text-gray-300 lg:w-auto lg:items-center lg:justify-center md:mb-0">
                        <span className="mx-auto text-xl font-black leading-none text-gray-900 dark:text-gray-300 select-none">Spotify Heardle<span className="text-indigo-600 dark:text-indigo-200">.</span></span>
                    </Link>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    {/* <Link to={'/search'} className="font-medium text-gray-900 dark:text-gray-300">Search</Link> */}
                    {userSessions?.length ? (
                        <Dropdown label="Session" options={userSessions} selected={session} onSelect={handleSessionChange} />
                    ): null}
                    {user ? (
                        <span onClick={() => logout()} className="mx-auto text-xl font-black leading-none text-gray-900 pointer dark:text-gray-300 select-none">Logout</span>
                    ) : null}
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