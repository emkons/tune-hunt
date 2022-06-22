import React, { useMemo, useState } from "react";
import Select, { createFilter } from "react-select";
import Check from "./icons/Check";

const AnswerInput = ({ tracks = [], onSubmit }) => {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const options = useMemo(() => {
    return tracks.map((t) => ({
      value: t?.track?.id,
      label: `${t?.track?.name} - ${t?.track?.artists.map(a => a?.name).join(', ')}`,
    }));
  }, [tracks]);

  const filterConfig = {
    ignoreCase: true,
    ignoreAccents: true,
    trim: true,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: validate if track exists
    console.log(selectedTrack);
    onSubmit?.(tracks.find((t) => t?.track?.id === selectedTrack.value));
    setSelectedTrack(null);
  };

  const handleSkip = () => {
    onSubmit?.({skipped: true})
  }

  return (
    <form
      className="relative w-full flex items-center flex-row gap-4"
      onSubmit={handleSubmit}
    >
      <button type="button" onClick={() => handleSkip()} className="py-2 px-4 bg-gray-300 text-white rounded">Skip</button>
      <Select
        className="flex-grow"
        menuPlacement="top"
        value={selectedTrack}
        filterOption={createFilter(filterConfig)}
        onChange={(value) => setSelectedTrack(value)}
        options={options}
      />
      <button
        type="submit"
        className="p-3 bg-green-800 text-white shadow rounded-full"
      >
        <Check size={24} />
      </button>
    </form>
  );
};

export default AnswerInput;
