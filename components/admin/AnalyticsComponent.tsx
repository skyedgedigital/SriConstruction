"use client";
import React, { useState, useEffect } from "react";

const AnalyticsComponent = ({ data, color, tag }) => {
  const [count, setCount] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = Math.ceil(data / (duration / 100));

    const interval = setInterval(() => {
      start += increment;
      if (start >= data) {
        setCount(data);
        setPercentage(100);
        clearInterval(interval);
      } else {
        setCount(start);
        setPercentage((start / data) * 100);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [data]);

  const circleRadius = 50;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`flex min-w-64 flex-col items-center p-5 m-5 rounded-md cursor-pointer shadow-md transform transition-transform duration-300 ease-in-out`}
      style={{
        backgroundColor: color
          ? `var(--color-${color}-100)`
          : "var(--color-green-100)",
        transition: "background-color 0.3s ease, transform 0.3s ease",
        //@ts-ignore
        "--color-red-100": "#ffcccc",
        "--color-green-100": "#d4edda",
        "--color-blue-100": "#cce5ff",
        "--color-violet-100": "#e5c6f0",
        "--color-purple-100": "#e2d8f0",
        "--color-orange-100": "#ffe5d9",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <svg className="w-32 h-32">
        <circle
          className="text-gray-300"
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          r={circleRadius}
          cx="60"
          cy="60"
        />
        <circle
          stroke={color} // Apply the color prop here
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          r={circleRadius}
          cx="60"
          cy="60"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <h2
        className="text-4xl font-bold mt-4"
        style={{ color: color ? `var(--color-${color})` : "#333" }}
      >
        {Math.round(count)}
      </h2>
      <p className="text-lg text-gray-700">{tag}</p>
    </div>
  );
};

export default AnalyticsComponent;
