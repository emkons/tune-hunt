import moment from "moment";
import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnswerInput from "../components/AnswerInput";
import Content from "../components/Content";
import Guesses from "../components/Guesses";
import History from "../components/History";
import ArrowLeft from "../components/icons/ArrowLeft";
import ArrowRight from "../components/icons/ArrowRight";
import Player from "../components/Player";
import PlaylistInfo from "../components/PlaylistInfo";
import { useFavourites } from "../context/FavouritesContext";
import { useSpotify } from "../context/SpotifyContext";
import useGameData from "../hooks/useGameData";
import { getSequence } from "../utils/sequence";

const startDate = moment([2022, 5, 13]);

const Game = ({ volume }) => {
    const navigate = useNavigate()
    const { playlistId } = useParams();
    const { apiInstance, removeToken } = useSpotify();
    const [tracks, setTracks] = useState([]);
    const [playlistImage, setPlaylistImage] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [playlistLink, setPlaylistLink] = useState("");
    const [playlistAuthor, setPlaylistAuthor] = useState("");
    const [todayIndex, setTodayIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const date = moment().format("YYYY-MM-DD");

    const [historyOpen, setHistoryOpen] = useState(false);

    const {favourites} = useFavourites();
    const currentFavouriteIndex = useMemo(
        () => favourites?.findIndex((fav) => fav.id === playlistId),
        [favourites, playlistId]
    );
    const prevFavourite = useMemo(
        () =>
            currentFavouriteIndex !== undefined &&
            currentFavouriteIndex !== -1 &&
            currentFavouriteIndex > 0
                ? favourites[currentFavouriteIndex - 1]
                : null,
        [currentFavouriteIndex, favourites]
    );
    const nextFavourite = useMemo(
        () =>
            currentFavouriteIndex !== undefined &&
            currentFavouriteIndex !== -1 &&
            currentFavouriteIndex < favourites?.length - 1
                ? favourites[currentFavouriteIndex + 1]
                : null,
        [currentFavouriteIndex, favourites]
    );

    const {
        todayTrack,
        setTodayTrack,
        guesses,
        setGuesses,
        correct,
        setCorrect,
        finished,
        setFinished,
    } = useGameData(playlistId, date);

    useEffect(() => {
        apiInstance
            ?.getPlaylist(playlistId, {
                market: process.env.REACT_APP_SPOTIFY_MARKET,
                fields: "external_urls,tracks.items(track.name,track.external_urls,track.preview_url,track.id,track.href,track.album.images,track.artists(name)),tracks.total,tracks.offset,name,owner.display_name,images",
            })
            .then(async (data) => {
                console.log(data);
                setPlaylistImage(data.images?.[0]?.url);
                setPlaylistAuthor(data.owner.display_name);
                setPlaylistName(data.name);
                setPlaylistLink(data.external_urls.spotify);
                let allTracks = data.tracks.items.filter(
                    (t) => t?.track?.preview_url !== null
                );
                let totalTracks = data.tracks.total;
                let currentTracks = data.tracks.items.length;
                while (currentTracks < totalTracks) {
                    const newData = await apiInstance?.getPlaylistTracks(
                        playlistId,
                        {
                            limit: 50,
                            offset: currentTracks,
                            market: process.env.REACT_APP_SPOTIFY_MARKET,
                            fields: "items(track.name,track.external_urls,track.preview_url,track.id,track.href,track.album.images,track.artists(name)),total,offset",
                        }
                    );
                    allTracks = [
                        ...allTracks,
                        ...newData.items.filter(
                            (t) => t?.track?.preview_url !== null
                        ),
                    ];
                    currentTracks += newData.items.length;
                    console.log("Additional tracks loaded", newData);
                }
                setTracks(allTracks);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                removeToken();
            });
    }, [apiInstance, playlistId]);

    useEffect(() => {
        // const availableSequence = tracks.map((t, i) => ({preview_url: t?.track.preview_url, index: i})).filter(t => t.preview_url !== null).map(t => t.index)
        const sequence = getSequence(playlistId, tracks.length);
        console.log(sequence);
        const diffDays = moment().diff(startDate, "days");
        setTodayIndex(sequence[diffDays % tracks.length]);
    }, [playlistId, tracks]);

    useEffect(() => {
        const track = tracks?.[todayIndex];
        if (track && Object.keys(track).length !== 0) {
            setTodayTrack(track);
            console.log("Setting track");
        }
        // eslint-disable-next-line
    }, [todayIndex, tracks]);

    const handleGuess = (track) => {
        setGuesses([...guesses, track]);
        if (track?.track?.id === todayTrack?.track?.id) {
            setCorrect(true);
            setFinished(true);
        }
        if (guesses.length === 5) {
            setFinished(true);
        }
    };

    const handleNavigateToPlaylist = (playlist) => {
        if (playlist !== null) {
            navigate(`/playlist/${playlist?.id}`)
        }
    }

    const emptyGameScreen = (
        <div className="flex flex-col flex-grow gap-4">
            <PlaylistInfo
                id={playlistId}
                name={playlistName}
                author={playlistAuthor}
                thumbnail={playlistImage}
                link={playlistLink}
                external={true}
                preText="Currently playing"
            />
            <div className="text-center">
                Sorry, no songs available from this playlist
            </div>
        </div>
    );

    const gameScreen = () => (
        <>
            {tracks.length > 0 ? (
                <div className="flex flex-col flex-grow justify-between items-center">
                    <PlaylistInfo
                        id={playlistId}
                        name={playlistName}
                        author={playlistAuthor}
                        thumbnail={playlistImage}
                        link={playlistLink}
                        external={true}
                        preText="Currently playing"
                    />
                    <Guesses guesses={guesses} correctTrack={todayTrack} />
                    <Player
                        volume={volume}
                        url={todayTrack?.track?.preview_url}
                        round={guesses.length}
                    />
                    <AnswerInput
                        tracks={tracks.filter(
                            (t) =>
                                !guesses.some(
                                    (g) => g?.track?.id === t?.track?.id
                                )
                        )}
                        onSubmit={handleGuess}
                    />
                </div>
            ) : (
                emptyGameScreen
            )}
        </>
    );

    const loadingScreen = () => (
        <div className="dark:text-gray-300">Loading...</div>
    );

    const endScreen = () => (
        <div className="flex flex-col flex-grow justify-between items-center">
            <PlaylistInfo
                id={playlistId}
                name={playlistName}
                author={playlistAuthor}
                thumbnail={playlistImage}
                link={playlistLink}
                external={true}
                preText="Currently playing"
            />
            <Guesses guesses={guesses} correctTrack={todayTrack} />
            <Player
                volume={volume}
                url={todayTrack?.track.preview_url}
                round={guesses.length}
                finished={finished}
            />
            <PlaylistInfo
                id={todayTrack?.track?.id}
                name={todayTrack?.track?.name}
                author={todayTrack?.track?.artists
                    .map((a) => a?.name)
                    .join(", ")}
                thumbnail={todayTrack?.track?.album?.images?.[0]?.url}
                link={todayTrack?.track?.external_urls?.spotify}
                correct={correct}
                external={true}
                isPlaylist={false}
                preText="Correct Song"
            />
            {/* <AnswerInput tracks={tracks} onSubmit={handleGuess} /> */}
        </div>
    );

    return (
        <div className="flex-grow flex justify-center">
            <div className="flex items-center">
                <div
                    className={
                        finished && prevFavourite
                            ? "text-indigo-500 cursor-pointer"
                            : "text-transparent"
                    }
                    onClick={() => handleNavigateToPlaylist(prevFavourite)}
                >
                    <ArrowLeft size={96} />
                </div>
            </div>
            <Content className="grow-0 mx-0">
                <div className="text-gray-200">
                    <svg
                        onClick={() => setHistoryOpen(true)}
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
                </div>
                {loading
                    ? loadingScreen()
                    : finished
                    ? endScreen()
                    : gameScreen()}
                {historyOpen ? (
                    <History
                        playlistId={playlistId}
                        onClose={() => setHistoryOpen(false)}
                    />
                ) : null}
            </Content>
            <div className="flex items-center">
                <div
                    className={
                        finished && nextFavourite
                            ? "text-indigo-500 cursor-pointer"
                            : "text-transparent"
                    }
                    onClick={() => handleNavigateToPlaylist(nextFavourite)}
                >
                    <ArrowRight size={96} />
                </div>
            </div>
        </div>
    );
};

export default Game;
