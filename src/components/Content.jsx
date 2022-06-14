import React, { useState } from 'react'

const Content = ({children}) => {
    const [loggedIn, setLoggedIn] = useState(false)
    // const [selectedPlaylist, setSelectedPlaylist] 

    return (
        <section className="w-full mx-auto lg:w-8/12 max-w-7xl bg-white flex flex-col flex-grow">
            {children}
        </section>
    )
}

export default Content