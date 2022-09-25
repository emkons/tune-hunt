import { useLiveQuery } from "dexie-react-hooks";
import React, { useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { db } from "../db";
import ArrowLeft from "./icons/ArrowLeft";
import ArrowRight from "./icons/ArrowRight";
import Check from "./icons/Check";
import X from "./icons/X";

const History = ({ playlistId, onClose }) => {
    const historyDataQuery = useLiveQuery(
        () =>
            db.playlistHistory
                .where({ id: playlistId })
                .filter((v) => v?.finished)
                .reverse()
                .toArray(),
        [playlistId]
    );

    const historyData = useMemo(() => historyDataQuery?.map(entry => ({...entry, track: entry.track || entry.todayTrack})), [historyDataQuery])

    const [distribution, setDistribution] = useState({});
    const [maxGuesses, setMaxGuesses] = useState(0);
    const [currentDayIndex, setCurrentDayIndex] = useState(0);

    useEffect(() => {
        const dist = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            'X': 0
        };
        historyData?.forEach((dayData) => {
            if (!dayData?.correct) {
                dist['X']++;
                return;
            }
            dist[dayData?.guesses?.length]++;
        });
        setDistribution(dist);
        setMaxGuesses(Math.max(...Object.values(dist)));
    }, [historyData]);

    const handleDayChange = (forward = false) => {
        if (forward && currentDayIndex > 0) {
            setCurrentDayIndex(currentDayIndex - 1);
        } else if (!forward && currentDayIndex < historyData.length - 1) {
            setCurrentDayIndex(currentDayIndex + 1);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-900/75">
            <div className="relative bg-gray-700 text-white rounded w-1/2 p-8">
                <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => onClose()}
                >
                    <svg
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
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
                <div>
                    <div className="text-2xl text-white text-center leading-tight mb-4">
                        History
                    </div>
                    <div className="bg-gray-800/20 p-2 rounded">
                        <div className="flex flex-col gap-3">
                            {Object.entries(distribution).map(([key, val]) => (
                                <div key={key} className="text-normal text-gray-300 flex items-stretch gap-3">
                                    <div className="">{key}</div>
                                    <div className="flex-grow">
                                        <div
                                            className={`rounded ${key === 'X' ? 'bg-gray-500' : 'bg-green-600'}`}
                                            style={{
                                                width: `${
                                                    (val / (maxGuesses || 1)) *
                                                    100
                                                }%`,
                                            }}
                                        >
                                            <div className="px-2">{val}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-normal text-center text-gray-300">
                        Score distribution
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3 mt-4">
                    <div onClick={() => handleDayChange(false)} className={currentDayIndex < historyData?.length - 1 ? 'text-gray-200 cursor-pointer' : 'text-gray-500'}>
                        <ArrowLeft />
                    </div>
                    <div className="overflow-x-hidden flex-grow">
                        <div
                            className="flex"
                            style={{ width: `${historyData?.length * 100}%`, transform: `translateX(-${currentDayIndex / (historyData?.length || 1) * 100}%)` }}
                        >
                            {historyData?.map((entry) => (
                                <div
                                    style={{
                                        width: `${
                                            100 / (historyData?.length || 1)
                                        }%`,
                                    }}
                                    key={entry.date}
                                    className="flex flex-col items-center"
                                >
                                    {entry?.track?.track?.album?.images?.[0]?.url ? (
                                        <img
                                            className="w-32 aspect-square object-cover rounded-lg shadow-lg antialiased"
                                            alt={entry?.track?.track?.name}
                                            src={entry?.track?.track?.album?.images?.[0]?.url}
                                        />
                                    ) : null}
                                    <div>
                                        {entry?.track?.track?.artists?.map(a => a?.name).join(', ')}{" - "}
                                        <span>
                                            {entry?.track?.track?.name}
                                        </span>
                                    </div>
                                    <div title={entry?.todayTrackIndex}>
                                        {entry?.correct ? (
                                            <Check color="green" />
                                        ) : (
                                            <X color="red" />
                                        )}
                                    </div>
                                    {entry?.date}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div onClick={() => handleDayChange(true)} className={currentDayIndex > 0 ? 'text-gray-200 cursor-pointer' : 'text-gray-500'}>
                        <ArrowRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
