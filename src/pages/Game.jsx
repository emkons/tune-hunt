import { useLiveQuery } from "dexie-react-hooks";
import moment from "moment";
import React, { useCallback, useEffect, useState, useMemo } from "react";
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
import { db } from "../db";
import useGameData from "../hooks/useGameData";
import { getSequence } from "../utils/sequence";
import Particles from "react-particles";
import { loadFull } from "tsparticles";

const startDate = moment([2022, 5, 13]);

const Game = ({ volume }) => {
    const navigate = useNavigate();
    const { playlistId } = useParams();
    const { apiInstance, errorHandler } = useSpotify();
    // const [tracks, setTracks] = useState([]);
    const tracks = useLiveQuery(
        () =>
            db.tracks.where("playlist").equals(playlistId).sortBy("key") || [],
        [playlistId],
        []
    );
    const [playlistImage, setPlaylistImage] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [playlistLink, setPlaylistLink] = useState("");
    const [playlistAuthor, setPlaylistAuthor] = useState("");
    const [loading, setLoading] = useState(true);
    const [particlesContainer, setParticlesContainer] = useState(null);
    const date = moment().subtract(150, "minutes").format("YYYY-MM-DD");

    const [historyOpen, setHistoryOpen] = useState(false);

    const { favourites } = useFavourites();
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
        todayTrackIndex,
        setTodayTrackIndex,
        guesses,
        setGuesses,
        correct,
        setCorrect,
        finished,
        setFinished,
        historyLoading,
        snapshotId,
        setSnapshotId,
        save,
    } = useGameData(playlistId, date);

    const particlesInit = useCallback(async (engine) => {
        // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async (container) => {
        // container.stop();
        setParticlesContainer(container);
    }, []);

    useEffect(() => {
        if (particlesContainer) {
            if (finished && correct) {
                particlesContainer.start()
                particlesContainer.play()
            } else {
                particlesContainer.stop()
            }
        }
    }, [particlesContainer, correct, finished])

    const setTracks = async (newTracks) => {
        await db.tracks.where({ playlist: playlistId }).delete();
        const mappedTracks = newTracks.map((t, index) => ({
            key: index,
            playlist: playlistId,
            ...t,
        }));
        await db.tracks.bulkPut(mappedTracks);
    };

    const fetchNewSongs = () => {
        setLoading(true);
        apiInstance
            ?.getPlaylist(playlistId, {
                market: process.env.REACT_APP_SPOTIFY_MARKET,
                fields: "external_urls,tracks.items(track.name,track.external_urls,track.preview_url,track.id,track.href,track.album.images,track.album.release_date,track.artists(name)),tracks.total,tracks.offset,name,owner.display_name,images,snapshot_id",
            })
            .then(async (data) => {
                setPlaylistImage(data.images?.[0]?.url);
                setPlaylistAuthor(data.owner.display_name);
                setPlaylistName(data.name);
                setPlaylistLink(data.external_urls.spotify);
                let allTracks = data.tracks.items.filter(
                    (t) => t?.track?.preview_url !== null
                );
                let totalTracks = data.tracks.total;
                let currentTracks = data.tracks.items.length;
                try {
                    while (currentTracks < totalTracks) {
                        const newData = await apiInstance?.getPlaylistTracks(
                            playlistId,
                            {
                                limit: 50,
                                offset: currentTracks,
                                market: process.env.REACT_APP_SPOTIFY_MARKET,
                                fields: "items(track.name,track.external_urls,track.preview_url,track.id,track.href,track.album.images,track.album.release_date,track.artists(name)),total,offset",
                            }
                        );
                        allTracks = [
                            ...allTracks,
                            ...newData.items.filter(
                                (t) => t?.track?.preview_url !== null
                            ),
                        ];
                        currentTracks += newData.items.length;
                    }
                } catch (err) {
                    errorHandler(err)
                }
                setSnapshotId(data.snapshot_id)
                await setTracks(allTracks);
                setLoading(false);
            })
            .catch(errorHandler);
    };

    useEffect(() => {
        // setLoading(true)
        if (historyLoading) {
            console.log("History loading...");
            setLoading(true);
            return;
        }
        apiInstance
            ?.getPlaylist(playlistId, {
                market: process.env.REACT_APP_SPOTIFY_MARKET,
                fields: "external_urls,name,owner.display_name,images,snapshot_id",
            })
            .then(async (data) => {
                const newSnapshot = data.snapshot_id;
                fetchNewSongs();
            }).catch(errorHandler);
    }, [historyLoading, apiInstance]);

    useEffect(() => {
        const sequence = getSequence(playlistId, tracks.length);
        console.log(sequence);
        const diffDays = moment()
            .subtract(150, "minutes")
            .diff(startDate, "days");
        console.log(diffDays);
        setTodayTrackIndex(sequence[diffDays % tracks.length]);
    }, [playlistId, tracks]);

    useEffect(() => {
        const track = tracks?.[todayTrackIndex];
        if (track && Object.keys(track).length !== 0) {
            setTodayTrack(track);
            console.log("Setting track");
        }
        // eslint-disable-next-line
    }, [todayTrackIndex, tracks]);

    const handleGuess = async (track) => {
        if (track?.track?.id === todayTrack?.track?.id) {
            setCorrect(true);
            setFinished(true);
        }
        if (guesses.length === 5) {
            setFinished(true);
        }
        setGuesses([...guesses, track]);
        save()
    };

    const handleNavigateToPlaylist = (playlist) => {
        if (playlist !== null) {
            navigate(`/playlist/${playlist?.id}`);
        }
    };

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
                <>
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
                </>
            ) : (
                emptyGameScreen
            )}
        </>
    );

    const loadingScreen = () => (
        <div className="dark:text-gray-300 text-center">Loading...</div>
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
                year={todayTrack?.track?.album?.release_date}
                external={true}
                isPlaylist={false}
                preText="Correct Song"
            />
            {/* <AnswerInput tracks={tracks} onSubmit={handleGuess} /> */}
        </div>
    );

    return (
        <>
            <Particles
                    id="tsparticles"
                    url="/confetti.json"
                    init={particlesInit}
                    loaded={particlesLoaded}
                />
            <div className="flex-grow flex justify-center z-10">
                <div className="flex items-center">
                    <div
                        className={
                            prevFavourite
                                ? "text-indigo-500 cursor-pointer"
                                : "text-transparent"
                        }
                        onClick={() => handleNavigateToPlaylist(prevFavourite)}
                    >
                        <ArrowLeft size={96} />
                    </div>
                </div>
                <Content className="grow-0 mx-0">
                    {/* <div className="text-gray-200 flex justify-between">
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
                    </div> */}
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
                            nextFavourite
                                ? "text-indigo-500 cursor-pointer"
                                : "text-transparent"
                        }
                        onClick={() => handleNavigateToPlaylist(nextFavourite)}
                    >
                        <ArrowRight size={96} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Game;
