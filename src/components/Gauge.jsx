import React from "react";
export const Gauge = ({ percent = 0, radius, total, actual, ...rest }) => {
    const strokeWidth = radius * 0.2;
    const innerRadius = radius - strokeWidth;
    const circumference = innerRadius * 2 * Math.PI;
    const arc = circumference * 0.75;
    const dashArray = `${arc} ${circumference}`;
    const transform = `rotate(135, ${radius}, ${radius})`;
    const offset = arc - (percent / 100) * arc;
    return (
        <svg height={radius * 2} width={radius * 2} {...rest}>
            <defs></defs>
            <circle
                className="gauge_base"
                cx={radius}
                cy={radius}
                fill="transparent"
                r={innerRadius}
                stroke="gray"
                strokeDasharray={dashArray}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                transform={transform}
            />
            <circle
                className="gauge_percent"
                cx={radius}
                cy={radius}
                fill="transparent"
                r={innerRadius}
                stroke="#00c100"
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                style={{
                    transition: "stroke-dashoffset 0.3s",
                }}
                transform={transform}
            />
            <text x="50%" y="50%" fill="#fff" fontSize={50} dominantBaseline="middle" textAnchor="middle">{actual} / {total}</text>    
        </svg>
    );
};
