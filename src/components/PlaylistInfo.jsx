import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFavourites } from "../context/FavouritesContext";
import Star from "./icons/Star";

const PlaylistInfo = ({
    id,
    name,
    author,
    thumbnail,
    preText,
    link = "/",
    songCount,
    external = false,
    isPlaylist = true,
}) => {
    const { favourites, addFavourite, removeFavourite } = useFavourites();

    const favourite = useMemo(() => {
        // console.log(favourites)
        return (favourites || []).find((fav) => fav?.id === id);
    }, [favourites, id]);

    const toggleFavourite = () => {
        const fav = {
            id,
            name,
            author,
            thumbnail,
        };
        if (favourite) {
            removeFavourite(fav);
        } else {
            addFavourite(fav);
        }
    };

    return (
        <div className="grid justify-items-center max-w-md">
            { preText ? <div>{preText}</div> : null }
            <div className="rounded-lg shadow-lg bg-gray-600 w-full grid grid-cols-3 p-3 antialiased">
                <div className="w-full">
                    {external ? (
                        <a href={link} target="_blank" rel="noreferrer">
                            <img
                                className="rounded-lg shadow-lg antialiased"
                                alt={name}
                                src={thumbnail}
                            />
                        </a>
                    ) : (
                        <Link to={link}>
                            <img
                                className="rounded-lg shadow-lg antialiased"
                                alt={name}
                                src={thumbnail}
                            />
                        </Link>
                    )}
                </div>
                <div className="px-3 col-span-2 flex flex-col flex-grow justify-between flex-wrap">
                    <div className="w-full text-left text-gray-700 font-semibold relative pt-3 md:pt-0">
                        <div className="text-2xl text-white leading-tight">
                            {name}
                        </div>
                        <div className="text-normal text-gray-300">
                            by -{" "}
                            <span className="border-b border-dashed border-gray-500 pb-1">
                                {author}
                            </span>
                        </div>
                    </div>
                    {isPlaylist ? (
                        <div className="w-full flex justify-end text-right">
                            <div
                                className="cursor-pointer"
                                onClick={() => toggleFavourite()}
                            >
                                <Star size={32} color={favourite ? "yellow" : "black"} filled={favourite} />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PlaylistInfo;
