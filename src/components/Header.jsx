import React from 'react'

const Header = () => {
    return (
        <section class="w-full px-8 text-gray-700 bg-white">
            <div class="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl">
                <div class="relative flex flex-col md:flex-row">
                    <a href="#_" class="flex items-center mb-5 font-medium text-gray-900 lg:w-auto lg:items-center lg:justify-center md:mb-0">
                        <span class="mx-auto text-xl font-black leading-none text-gray-900 select-none">Spotify Heardle<span class="text-indigo-600">.</span></span>
                    </a>
                </div>

                <div class="inline-flex items-center ml-5 space-x-6 lg:justify-end">
                    <a href="#" class="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                        Log into Spotify
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Header