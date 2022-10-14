import React, { useState } from 'react'
import { useFavourites } from '../context/FavouritesContext'
import { useFirebase } from '../context/FirebaseContext'
import useSettings from '../hooks/useSettings'
import { migrateToFirebase } from '../utils/historyMigrate'
import Cog from './icons/Cog'
import UploadCloud from './icons/UploadCloud'
import Settings from './Settings'

const Footer = () => {
    const { session } = useFirebase()
    const { updateFavourites } = useFavourites()
    const [darkMode, setDarkMode] = useSettings('darkMode', () => window.matchMedia('(prefers-color-scheme: dark)').matches)
    const [settingOpen, setSettingsOpen] = useState(false)

    return (
        <section className="text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 body-font z-20">
            <div className="container flex flex-col items-center px-8 py-8 mx-auto max-w-7xl sm:flex-row">
                <a href="#_" className="text-xl font-black leading-none text-gray-900 dark:text-gray-300 select-none logo">emkons<span className="text-indigo-600 dark:text-gray-200">.</span></a>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 sm:ml-4 sm:pl-4 sm:border-l sm:border-gray-200 sm:mt-0">© 2022
                </p>
                <span className="inline-flex justify-center mt-4 space-x-5 sm:ml-auto sm:mt-0 sm:justify-start">
                    <a href="https://github.com/emkons/spotify-heardle" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">GitHub</span>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                        </svg>
                    </a>
                    <div onClick={() => setDarkMode(!darkMode)} className="text-gray-400 hover:text-gray-500 pointer-cursor">
                        <span className="sr-only">DarkMode</span>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={darkMode ? 'currentColor' : 'none'} fill={darkMode ? 'none' : 'currentColor'} aria-hidden="true">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </div>
                    <div onClick={() => setSettingsOpen(!settingOpen)} className="text-gray-400 hover:text-gray-500 pointer-cursor">
                        <span className="sr-only">Settings</span>
                        <Cog />
                    </div>
                    {/* {session ? (
                    <div onClick={() => migrateToFirebase(updateFavourites, session)} className="text-gray-400 hover:text-gray-500 pointer-cursor">
                        <span className="sr-only">Migrate</span>
                        <UploadCloud />
                    </div>
                    ) : null} */}
                </span>
            </div>
            {settingOpen ? <Settings onClose={() => setSettingsOpen(!settingOpen)} /> : null}
        </section>
    )
}

export default Footer