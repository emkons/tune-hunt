import React, { useState } from "react";
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

const PlaylistSelect = () => {
    const navigate = useNavigate();
    const [link, setLink] = useState("");
    const [error, setError] = useState("");
    const { favourites } = useFavourites();
    const [ localFavourites, setLocalFavourites ] = useState([])
    const sensors = useSensors(useSensor(PointerSensor));
    
    useEffect(() => {
        setLocalFavourites([])
        // eslint-disable-next-line
    }, [favourites])

    const visibleFavourites = useMemo(() => {
        // Hack to avoid flickering while fetching updated favourites
        return localFavourites.length > 0 ? localFavourites : favourites
    }, [favourites, localFavourites])

    const onTextChange = (event) => {
        setLink(event.target.value);
        setError("");
    };

    const goToPlaylist = (e) => {
        e.preventDefault();
        const parsed = parse(link);
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
            setLocalFavourites(reorderedList)
            db.favourites.bulkPut(reorderedList);
        }
    };

    const shuffle = () => {
        const shuffledList = [{...favourites[1], position: 0}, {...favourites[2], position: 1}, {...favourites[0], position: 2}]
        db.favourites.bulkPut(shuffledList)
    }

    return (
        <Content>
            <div className="container mx-auto px-4 py-14 sm:px-6 xl:px-12">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <h1 className="text-4xl font-bold tracking-normal sm:text-5xl dark:text-gray-300 lg:text-6xl">
                        Select Playlist
                    </h1>
                    <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">
                        Paste url of a spotify playlist below to get started
                    </p>
                    <form
                        onSubmit={(e) => goToPlaylist(e)}
                        className="flex w-full max-w-md flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3"
                    >
                        <input
                            type="text"
                            className="w-full rounded-md border bg-gray-50 dark:bg-gray-500 dark:text-gray-50 dark:border-gray-400 dark:placeholder-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Spotify URL"
                            value={link}
                            onChange={onTextChange}
                        />
                        <div>{error}</div>
                        <button
                            type="submit"
                            className="w-full rounded-md border border-blue-500 bg-blue-500 py-2 px-6 text-white transition hover:border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-blue-500 disabled:hover:bg-blue-500 sm:max-w-max"
                        >
                            Go
                        </button>
                    </form>
                    <p className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">
                        or
                    </p>
                    <p onClick={() => shuffle()} className="max-w-screen-sm text-lg text-gray-600 dark:text-gray-300 sm:text-2xl">
                        Choose one from the list below
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
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
                </div>
            </div>
        </Content>
    );
};

export default PlaylistSelect;
