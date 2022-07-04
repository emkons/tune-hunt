import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Range } from "react-range";

const VolumeSlider = ({ value = 20, setValue }) => {

    const [values, setValues] = useState([50])

    const onFinalChange = (v) => {
        setValue(v[0])
        setValues(v)
        console.log(v)
    }

    useEffect(() => {
        setValues([value])
    }, [value])

    return (
        <div className="w-16">
            <Range
                step={1}
                min={1}
                max={100}
                values={values}
                onChange={(v) => setValues(v)}
                onFinalChange={(v) => onFinalChange(v)}
                renderTrack={({ props, children }) => (
                    <div
                    {...props}
                    className="w-full h-1 bg-gray-200"
                    >
                    {children}
                    </div>
                )}
                renderThumb={({ props }) => (
                    <div
                    {...props}
                    className="w-4 h-4 bg-green-300 rounded-full border-none outline-0"
                    />
                )}
            />
        </div>
    );
};

export default VolumeSlider;
