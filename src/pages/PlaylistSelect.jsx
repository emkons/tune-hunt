import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Content from "../components/Content";
import { parse } from "spotify-uri";
import { useFavourites } from "../context/FavouritesContext";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import PlaylistInfoSortable from "../components/PlaylistInfoSortable";
import { db } from "../db";
import { arrayMoveImmutable } from "array-move";
import { useEffect } from "react";
import { useMemo } from "react";
import { useSpotify } from "../context/SpotifyContext";
import PlaylistInfo from "../components/PlaylistInfo";
import { useFirebase } from "../context/FirebaseContext";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { migrateToFirebase } from "../utils/historyMigrate";

const PlaylistSelect = () => {
    const navigate = useNavigate();
    // const [link, setLink] = useState("");
    const [error, setError] = useState("");
    const { favourites, updateFavourites } = useFavourites();
    const [localFavourites, setLocalFavourites] = useState([]);
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            delay: 50,
            tolerance: 5
        }
    }));

    // Search things
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isPlaylistLink, setIsPlaylistLink] = useState(false);
    const [searching, setSearching] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const { apiInstance, errorHandler } = useSpotify();
    const {user, session} = useFirebase()
    const requestRateLimitRef = useRef(null);

    useEffect(() => {
        setLocalFavourites([]);
        // eslint-disable-next-line
    }, [favourites]);

    const visibleFavourites = useMemo(() => {
        // Hack to avoid flickering while fetching updated favourites
        return localFavourites.length > 0 ? localFavourites : favourites;
    }, [favourites, localFavourites]);

    const onTextChange = (event) => {
        setError("");
        const query = event.target.value;
        setSearchQuery(query);
        setIsLink(false);
        setIsPlaylistLink(false)

        try {
            const parsed = parse(query);
            if (!parsed?.type) {
                return;
            }
            setIsLink(true);
            if (parsed?.type !== "playlist") {
                setError("Only playlist links supported");
                return;
            }
            setIsPlaylistLink(true)
        } catch (e) {
            if (e.name !== "TypeError") {
                console.error(e);
            }
        }
    };

    useEffect(() => {
        clearTimeout(requestRateLimitRef.current);
        if (!searchQuery || !apiInstance) {
            setSearching(false);
            return;
        }

        if (isLink) {
            return;
        }
        requestRateLimitRef.current = setTimeout(() => {
            setLoading(true);
            setSearching(true);
            apiInstance
                ?.searchPlaylists(searchQuery, {
                    market: process.env.REACT_APP_SPOTIFY_MARKET,
                    limit: 6,
                })
                .then(async (data) => {
                    setPlaylists(data?.playlists?.items);
                    setLoading(false);
                })
                .catch(errorHandler);
        }, 1000);
    }, [apiInstance, searchQuery, isLink]);

    const goToPlaylist = (e) => {
        e.preventDefault();
        const parsed = parse(searchQuery);
        if (!parsed?.type) {
            setError("Invalid URL");
            return;
        }
        if (parsed?.type !== "playlist") {
            setError("Only playlist links supported");
            return;
        }
        console.log(parsed);
        navigate(`/playlist/${parsed?.id}`);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const originalIndex = favourites.findIndex(
                (fav) => fav.id === active.id
            );
            const overIndex = favourites.findIndex((fav) => fav.id === over.id);
            const reorderedList = arrayMoveImmutable(
                favourites,
                originalIndex,
                overIndex
            ).map((fav, index) => ({ ...fav, position: index }));
            setLocalFavourites(reorderedList);

            updateFavourites(reorderedList)
        }
    };

    const FavouritesList = (
        <div className={`grid grid-cols-1 md:grid-cols-2 col-span-2 gap-4 ${!visibleFavourites?.length ? '': null}`}>
            {!visibleFavourites?.length ? (
            <div className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl col-span-2">
                We recently moved storage from local DB to server.
                <br />
                If you have not yet migrated, press the button below.
                <br />
                <button className="mx-auto text-xl font-black leading-none text-gray-900 pointer dark:text-gray-300 select-none" onClick={() => migrateToFirebase(updateFavourites, session)}>Migrate</button>
            </div>
            ) : null}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={visibleFavourites || []}>
                    {(visibleFavourites || []).map((fav) => (
                        <PlaylistInfoSortable
                            key={fav.id}
                            id={fav.id}
                            name={fav.name}
                            author={fav.author}
                            thumbnail={fav.thumbnail}
                            link={`/playlist/${fav.id}`}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );

    const SearchResults = (
        <>
            {loading ? (
                <div className="dark:text-gray-300">Loading...</div>
            ) : (
                <>
                    {(playlists || []).map((playlist) => (
                        <PlaylistInfo
                            key={playlist?.id}
                            id={playlist?.id}
                            name={playlist?.name}
                            author={playlist?.owner?.display_name}
                            thumbnail={playlist?.images?.[0]?.url}
                            link={`/playlist/${playlist?.id}`}
                        />
                    ))}
                </>
            )}
        </>
    );

    return (
        <Content>
            <div className="container mx-auto px-4 py-14 sm:px-6 xl:px-12">
                {/* <div className="text-gray-200">
                    <svg
                        onClick={() => navigate('/stats')}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 20v-6M6 20V10M18 20V4" />
                    </svg>
                </div> */}
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <h1 className="text-4xl font-bold tracking-normal sm:text-5xl dark:text-gray-300 lg:text-6xl">
                        Select Playlist
                    </h1>
                    <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">
                        Paste spotify playlist URL or search for playlist below
                    </p>
                    <form
                        onSubmit={(e) => goToPlaylist(e)}
                        className="flex w-full max-w-md flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3"
                    >
                        <input
                            type="text"
                            className="w-full rounded-md border bg-gray-50 dark:bg-gray-500 dark:text-gray-50 dark:border-gray-400 dark:placeholder-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Spotify URL or playlist name"
                            value={searchQuery}
                            onChange={onTextChange}
                        />
                        <button
                            type="submit"
                            style={{ display: isPlaylistLink ? "block" : "none" }}
                            className="w-full rounded-md border border-blue-500 bg-blue-500 py-2 px-6 text-white transition hover:border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-blue-500 disabled:hover:bg-blue-500 sm:max-w-max"
                        >
                            Go
                        </button>
                    </form>
                    <div className="text-red-600 dark:text-red-300">{error}</div>
                    {searching ? null : (
                        <>
                            <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">
                                or
                            </p>
                            <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">
                                Choose one of your favourites
                            </p>
                        </>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                        {searching ? SearchResults : FavouritesList}
                    </div>
                </div>
            </div>
        </Content>
    );
};

export default PlaylistSelect;
