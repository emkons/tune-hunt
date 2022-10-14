import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpotifyAuth } from "react-spotify-auth";
import Content from "../components/Content";
import { useFirebase } from "../context/FirebaseContext";
import { useSpotify } from "../context/SpotifyContext";
import useQuery from "../hooks/useQuery";
import { auth } from '../config/firebase'
import { signInWithCustomToken } from 'firebase/auth'

const Login = () => {
    const {user} = useFirebase()
    const navigate = useNavigate();
    const query = useQuery()
    const authRequestRef = useRef()

    useEffect(() => {
        const error = query.get('error')
        const code = query.get('code')
        const state = query.get('state')
        console.log(error, code, state)
        if (error) {
            console.error(error)
        } else {
            if (code && state && !authRequestRef.current) {
                authRequestRef.current = fetch(`${process.env.REACT_APP_AUTH_BASE_URL}token?code=${code}&state=${state}`)
                .then(res => res.json())
                .then(async (data) => {
                    console.log(data)
                    await signInWithCustomToken(auth(), data.token)
                    navigate("/playlist");
                })
            }
        }
    }, [navigate, query])

    useEffect(() => {
        if (user) {
            navigate("/playlist");
        }
    }, [navigate, user]);

    return (
        <Content>
            <div className="container mx-auto px-4 py-14 sm:px-6 xl:px-12">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <h1 className="text-4xl font-bold tracking-normal dark:text-gray-300 sm:text-5xl lg:text-6xl">
                        Spotify Heardle
                    </h1>
                    <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">
                        Select playlist, listen to part of the preview and try
                        to guess which of the songs it is.
                    </p>
                    <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">
                        To get started, click the below button to log into
                        spotify
                    </p>
                    <div className="w-48 dark:text-gray-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 496 512"
                            className="fill-green-500"
                            onClick={() => window.open(`${process.env.REACT_APP_AUTH_BASE_URL}redirect`,"_self")}
                        >
                            <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </Content>
    );
};

export default Login;
