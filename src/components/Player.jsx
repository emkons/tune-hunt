import React, { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/timeFormat";
import PauseCircle from "./icons/PauseCircle";
import PlayCircle from "./icons/PlayCircle";

const roundParts = {
  0: 1000,
  1: 2000,
  2: 4000,
  3: 7000,
  4: 11000,
  5: 16000,
};

const Player = ({ url, round, finished, volume }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef();

  const animationRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(url);
  }, [url]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    // TODO: Add audio control
    audioRef.current.volume = volume / 100;
    if (isPlaying) {
      audioRef.current.play();
      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(whilePlaying);
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if ((finished ? 30000 : roundParts[round]) - audioRef.current.currentTime * 1000 < 100) {
          setIsPlaying(false)
        }
      }, (finished ? 30000 : roundParts[round]) - audioRef.current.currentTime * 1000)
    } else {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
      clearTimeout(timerRef)
    }
    // eslint-disable-next-line
  }, [isPlaying, round]);

  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume])

  const whilePlaying = () => {
    setCurrentTime(audioRef.current.currentTime);
    if (audioRef.current.currentTime >= (finished ? 30000 : roundParts[round]) / 1000) {
      setIsPlaying(false)
    }
    if (audioRef.current.paused) {
      setIsPlaying(false)
    }
    animationRef.current = requestAnimationFrame(whilePlaying);
  };

  return (
    <div className="flex flex-row items-center gap-4 w-full">
      <div className="dark:text-gray-300">{formatTime(currentTime)}</div>
      <div className="w-full bg-gray-400 rounded-full h-2.5 flex-grow relative overflow-hidden">
        <div
          className="bg-gray-200 h-2.5 absolute top-0 left-0 right-0 bottom-0"
          style={{ width: `${finished ? 30000 : (roundParts[round] / 16) / 10}%` }}
        ></div>
        <div
          className="bg-blue-600 h-2.5 absolute top-0 left-0 right-0 bottom-0"
          style={{ width: `${(currentTime / (finished ? 30 : 16)) * 100}%` }}
        ></div>
        <div className="markers divide-x flex absolute top-0 left-0 right-0 bottom-0 items-center">
            <div className="border-gray-800 h-2" style={{width: `${1/16*100}%`}}></div>
            <div className="border-gray-800 h-2" style={{width: `${1/16*100}%`}}></div>
            <div className="border-gray-800 h-2" style={{width: `${2/16*100}%`}}></div>
            <div className="border-gray-800 h-2" style={{width: `${3/16*100}%`}}></div>
            <div className="border-gray-800 h-2" style={{width: `${4/16*100}%`}}></div>
            <div className="border-gray-800 h-2" style={{width: `${5/16*100}%`}}></div>
        </div>
      </div>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-0 bg-green-800 text-white dark:text-gray-300 shadow rounded-full"
      >
        {isPlaying ? (
          <PauseCircle />
        ) : (
          <PlayCircle />
        )}
      </button>
    </div>
  );
};

export default Player;
