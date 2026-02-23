// src/components/jukebox/ButtonPanel.tsx
import { useState, useCallback, useEffect, useRef } from "react";

type DisplayState = "normal" | "error" | "success";

function LEDDisplay({ value, state }: { value: string; state: DisplayState }) {
  // Pad to 3 characters, use underscore for empty
  const display = value.padEnd(3, "_");

  const bgColor = state === "error"
    ? "bg-red-900/80"
    : state === "success"
    ? "bg-green-900/80"
    : "bg-neutral-900";

  const textColor = state === "error"
    ? "text-red-400"
    : state === "success"
    ? "text-green-400"
    : "text-amber-400";

  return (
    <div className={`${bgColor} rounded-lg px-4 py-2 border-2 border-neutral-700 shadow-inner`}>
      <div className={`font-mono text-2xl font-bold tracking-[0.3em] ${textColor}`}
           style={{ textShadow: state === "normal" ? "0 0 10px currentColor" : "none" }}>
        {display.split("").map((char, i) => (
          <span key={i} className="inline-block w-6 text-center">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

export { LEDDisplay };
