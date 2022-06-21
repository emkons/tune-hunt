import React, { useEffect, useRef, useState } from "react";
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

const Player = ({ url, round, finished }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef();

  const timerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(url);
  }, [url]);

  useEffect(() => {
    // TODO: Add audio control
    audioRef.current.volume = 1;
    if (isPlaying) {
      audioRef.current.play();
      timerRef.current = setTimeout(
        () => setIsPlaying(false),
        finished ? 16000 : roundParts[round]
      );
      animationRef.current = requestAnimationFrame(whilePlaying);
    } else {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.pause();
      clearTimeout(timerRef.current);
      cancelAnimationFrame(animationRef.current);
    }
    // eslint-disable-next-line
  }, [isPlaying, round]);

  const whilePlaying = () => {
    setCurrentTime(audioRef.current.currentTime);
    animationRef.current = requestAnimationFrame(whilePlaying);
  };

  return (
    <div className="flex flex-row items-center gap-4">
      <div className="w-full bg-gray-400 rounded-full h-2.5 flex-grow relative overflow-hidden">
        <div
          className="bg-gray-200 h-2.5 absolute top-0 left-0 right-0 bottom-0"
          style={{ width: `${(roundParts[(finished ? 5 : round)] / 16) / 10}%` }}
        ></div>
        <div
          className="bg-blue-600 h-2.5 rounded-full absolute top-0 left-0 right-0 bottom-0"
          style={{ width: `${(currentTime / 16) * 100}%` }}
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
        className="p-0 bg-green-800 text-white shadow rounded-full"
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
