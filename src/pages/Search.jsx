import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Content from "../components/Content";
import { parse } from "spotify-uri";
import PlaylistInfo from "../components/PlaylistInfo";
import { useFavourites } from "../context/FavouritesContext";
import { useEffect } from "react";
import { useSpotify } from "../context/SpotifyContext";

const Search = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const { favourites } = useFavourites();
    const { apiInstance, removeToken } = useSpotify();
    const requestRateLimitRef = useRef(null);

    const onTextChange = (event) => {
        setSearchQuery(event.target.value);
    };

    useEffect(() => {
        if (!searchQuery || !apiInstance) {
            return;
        }
        clearTimeout(requestRateLimitRef.current);
        requestRateLimitRef.current = setTimeout(() => {
            setLoading(true);
            apiInstance
                ?.searchPlaylists(searchQuery, {
                    market: process.env.REACT_APP_SPOTIFY_MARKET,
                    limit: 6,
                })
                .then(async (data) => {
                    setPlaylists(data?.playlists?.items);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);
                });
        }, 1000);
    }, [apiInstance, searchQuery]);

    return (
        <Content>
            <div className="container mx-auto px-4 py-14 sm:px-6 xl:px-12">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <h1 className="text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">
                        Search Playlist
                    </h1>
                    <input
                        type="text"
                        className="w-full rounded-md border bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={onTextChange}
                    />
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
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
                        </div>
                    )}
                </div>
            </div>
        </Content>
    );
};

export default Search;
