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

type Props = {
  onSelectSong: (code: string) => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  canNavigateUp?: boolean;
  canNavigateDown?: boolean;
};

export function ButtonPanel({
  onSelectSong,
  onNavigateUp,
  onNavigateDown,
  canNavigateUp = true,
  canNavigateDown = true,
}: Props) {
  const [input, setInput] = useState("");
  const [displayState, setDisplayState] = useState<DisplayState>("normal");

  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
  const numbers = ["0", "1", "2", "3", "4", "5", "6"];

  const handleLetterPress = useCallback((letter: string) => {
    // Letter always replaces/sets first character
    setInput(letter);
    setDisplayState("normal");
  }, []);

  const handleNumberPress = useCallback((num: string) => {
    setInput(prev => {
      // Must have letter first
      if (prev.length === 0) return prev;
      // Max 3 characters (letter + 2 digits)
      if (prev.length >= 3) return prev;
      return prev + num;
    });
    setDisplayState("normal");
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setDisplayState("normal");
  }, []);

  const handleEnter = useCallback(() => {
    if (input.length !== 3) {
      setDisplayState("error");
      setTimeout(() => setDisplayState("normal"), 300);
      return;
    }

    const letter = input[0];
    const num = parseInt(input.slice(1), 10);

    // Validate: letter A-K, number 01-06
    const letterIndex = letter.charCodeAt(0) - 65;
    if (letterIndex < 0 || letterIndex > 10 || num < 1 || num > 6) {
      setDisplayState("error");
      setTimeout(() => setDisplayState("normal"), 300);
      return;
    }

    setDisplayState("success");
    onSelectSong(input);
    setTimeout(() => {
      setInput("");
      setDisplayState("normal");
    }, 500);
  }, [input, onSelectSong]);

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      {/* LED Display */}
      <LEDDisplay value={input} state={displayState} />

      {/* Letter row */}
      <div className="flex gap-1">
        {letters.map(letter => (
          <VintageButton
            key={letter}
            label={letter}
            onClick={() => handleLetterPress(letter)}
            variant="letter"
          />
        ))}
      </div>

      {/* Number row + controls */}
      <div className="flex gap-1 items-center">
        {numbers.map(num => (
          <VintageButton
            key={num}
            label={num}
            onClick={() => handleNumberPress(num)}
            variant="number"
          />
        ))}

        <div className="w-2" /> {/* Spacer */}

        <VintageButton label="▲" onClick={onNavigateUp} variant="action" disabled={!canNavigateUp} />
        <VintageButton label="▼" onClick={onNavigateDown} variant="action" disabled={!canNavigateDown} />

        <div className="w-2" /> {/* Spacer */}

        <VintageButton label="CLR" onClick={handleClear} variant="action" wide />
        <VintageButton label="OK" onClick={handleEnter} variant="action" wide />
      </div>
    </div>
  );
}

export { LEDDisplay };
