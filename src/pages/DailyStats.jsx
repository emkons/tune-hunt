import { useLiveQuery } from "dexie-react-hooks";
import moment from "moment";
import React, { useEffect } from "react";
import { useMemo } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpotifyAuth } from "react-spotify-auth";
import Content from "../components/Content";
import { Gauge } from "../components/Gauge";
import ArrowLeft from "../components/icons/ArrowLeft";
import ArrowRight from "../components/icons/ArrowRight";
import { useSpotify } from "../context/SpotifyContext";
import { db } from "../db";

const DailyStats = () => {
    const [date, setDate] = useState(moment());
    const dayStats = useLiveQuery(
        () => db.playlistHistory
        .where({ date: date.format('YYYY-MM-DD') })
        .filter((v) => v?.finished)
        .reverse()
        .toArray(),
        [date]
    );

    const dayTotal = useMemo(() => dayStats?.length || 0, [dayStats]);
    const dayCorrect = useMemo(
        () => dayStats?.filter((stat) => stat.correct)?.length || 0,
        [dayStats]
    );

    const handleDayChange = (forward = false) => {
        if (forward && moment().diff(date, "days") > 0) {
            setDate(date.clone().add(1, "days"));
        } else if (!forward) {
            setDate(date.clone().subtract(1, "days"));
        }
    };

    return (
        <Content>
            <div className="container mx-auto px-4 py-14 sm:px-6 xl:px-12">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <h1 className="text-4xl font-bold tracking-normal sm:text-5xl dark:text-gray-300 lg:text-6xl">
                        Daily Stats
                    </h1>
                    <div className="text-gray-200">{date.format('YYYY-MM-DD')}</div>
                    <div className="flex flex-row items-center gap-3 mt-4">
                        <div
                            onClick={() => handleDayChange(false)}
                            className="text-gray-200 cursor-pointer"
                        >
                            <ArrowLeft />
                        </div>
                        <div className="overflow-x-hidden flex-grow">
                            <div className="gauge-wrapper">
                                <Gauge
                                    radius={200}
                                    percent={dayTotal > 0 ? dayCorrect / dayTotal * 100 : 0}
                                    actual={dayCorrect}
                                    total={dayTotal}
                                />
                            </div>
                        </div>
                        <div
                            onClick={() => handleDayChange(true)}
                            className={
                                moment().diff(date, "days") > 0
                                    ? "text-gray-200 cursor-pointer"
                                    : "text-gray-500"
                            }
                        >
                            <ArrowRight />
                        </div>
                    </div>
                </div>
            </div>
        </Content>
    );
};

export default DailyStats;
