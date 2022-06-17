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
        <div className="flex flex-col items-center">
            <div>{preText}</div>
            <div className="rounded-lg shadow-lg bg-gray-600 w-2/3 flex flex-row flex-wrap p-3 antialiased">
                <div className="md:w-1/3 w-full">
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
                <div className="md:w-2/3 w-full px-3 flex flex-col justify-between flex-wrap">
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
                                <Star color={favourite ? "yellow" : "black"} />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PlaylistInfo;
