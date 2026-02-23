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

type VintageButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "letter" | "number" | "action";
  wide?: boolean;
};

function VintageButton({ label, onClick, disabled, variant = "letter", wide }: VintageButtonProps) {
  const baseStyles = "font-mono font-bold uppercase transition-all duration-75 select-none";
  const sizeStyles = wide ? "px-3 py-1.5 text-xs" : "w-7 h-7 text-sm";

  const variantStyles = {
    letter: "bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900 border-amber-300",
    number: "bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900 border-amber-300",
    action: "bg-gradient-to-b from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles} ${sizeStyles} ${variantStyles[variant]}
        rounded border-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_rgba(0,0,0,0.2),0_3px_3px_rgba(0,0,0,0.1)]
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_0_rgba(0,0,0,0.2),0_2px_2px_rgba(0,0,0,0.1)]
        active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]
        active:translate-y-0.5
        disabled:opacity-40 disabled:cursor-not-allowed
        flex items-center justify-center
      `}
    >
      {label}
    </button>
  );
}

export { LEDDisplay };
