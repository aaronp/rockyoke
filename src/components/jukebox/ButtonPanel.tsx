// src/components/jukebox/ButtonPanel.tsx
import { useState, useCallback, useEffect, useRef } from "react";

function useClackSfx() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx() {
    if (!ctxRef.current) {
      // @ts-expect-error webkitAudioContext for Safari
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    return ctxRef.current;
  }

  async function resumeIfNeeded() {
    const ctx = getCtx();
    if (!ctx) return null;
    if (ctx.state !== "running") {
      try { await ctx.resume(); } catch { /* ignore */ }
    }
    return ctx;
  }

  function clack(strength = 0.9) {
    const ctx = getCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t0);
    osc.frequency.exponentialRampToValueAtTime(70, t0 + 0.08);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.18 * strength, t0 + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.14);

    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.55;
    noise.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(1400, t0);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.11 * strength, t0 + 0.004);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
    noise.connect(hp);
    hp.connect(ng);
    ng.connect(ctx.destination);
    noise.start(t0 + 0.004);
    noise.stop(t0 + 0.06);
  }

  return { resumeIfNeeded, clack };
}

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
    <div className={`${bgColor} rounded px-2 py-1 border border-neutral-700 shadow-inner`}>
      <div className={`font-mono text-sm font-bold tracking-[0.2em] ${textColor}`}
           style={{ textShadow: state === "normal" ? "0 0 8px currentColor" : "none" }}>
        {display.split("").map((char, i) => (
          <span key={i} className="inline-block w-4 text-center">
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
  const sizeStyles = wide ? "px-2 py-0.5 text-[10px]" : "w-5 h-5 text-[10px]";

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

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
const NUMBERS = ["0", "1", "2", "3", "4", "5", "6"];

export function ButtonPanel({
  onSelectSong,
  onNavigateUp,
  onNavigateDown,
  canNavigateUp = true,
  canNavigateDown = true,
}: Props) {
  const [input, setInput] = useState("");
  const [displayState, setDisplayState] = useState<DisplayState>("normal");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sfx = useClackSfx();

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleLetterPress = useCallback((letter: string) => {
    sfx.clack(0.7);
    setInput(letter);
    setDisplayState("normal");
  }, [sfx]);

  const handleNumberPress = useCallback((num: string) => {
    sfx.clack(0.7);
    setInput(prev => {
      if (prev.length === 0) return prev;
      if (prev.length >= 3) return prev;
      return prev + num;
    });
    setDisplayState("normal");
  }, [sfx]);

  const handleClear = useCallback(() => {
    sfx.clack(0.6);
    setInput("");
    setDisplayState("normal");
  }, [sfx]);

  const handleEnter = useCallback(() => {
    sfx.clack(0.8);
    // Clear any pending timer
    if (timerRef.current) clearTimeout(timerRef.current);

    if (input.length !== 3) {
      setDisplayState("error");
      timerRef.current = setTimeout(() => setDisplayState("normal"), 300);
      return;
    }

    const letter = input[0];
    const num = parseInt(input.slice(1), 10);

    // Validate: letter A-K, number 01-06
    const letterIndex = letter.charCodeAt(0) - 65;
    if (letterIndex < 0 || letterIndex > 10 || num < 1 || num > 6) {
      setDisplayState("error");
      timerRef.current = setTimeout(() => setDisplayState("normal"), 300);
      return;
    }

    setDisplayState("success");
    onSelectSong(input);
    timerRef.current = setTimeout(() => {
      setInput("");
      setDisplayState("normal");
    }, 500);
  }, [input, onSelectSong, sfx]);

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toUpperCase();

      // Letters A-K
      if (key >= "A" && key <= "K") {
        e.preventDefault();
        handleLetterPress(key);
      }
      // Numbers 0-6
      else if (key >= "0" && key <= "6") {
        e.preventDefault();
        handleNumberPress(key);
      }
      // Backspace = Clear
      else if (e.key === "Backspace") {
        e.preventDefault();
        handleClear();
      }
      // Enter = Submit
      else if (e.key === "Enter") {
        e.preventDefault();
        handleEnter();
      }
      // Arrow keys = Navigate
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (canNavigateUp) onNavigateUp();
      }
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (canNavigateDown) onNavigateDown();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLetterPress, handleNumberPress, handleClear, handleEnter, onNavigateUp, onNavigateDown, canNavigateUp, canNavigateDown]);

  return (
    <div className="flex items-center justify-center h-full w-full p-2">
      <div className="flex items-center gap-3 bg-neutral-800/90 rounded-xl px-4 py-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.1)]">
        {/* Button grid - letters above numbers, aligned */}
        <div className="flex flex-col gap-0.5">
          {/* Letter row: A-K (11 buttons) */}
          <div className="flex gap-0.5">
            {LETTERS.map(letter => (
              <VintageButton
                key={letter}
                label={letter}
                onClick={() => handleLetterPress(letter)}
                variant="letter"
              />
            ))}
          </div>

          {/* Number row: 0-6 aligned under A-G, then spacers */}
          <div className="flex gap-0.5">
            {NUMBERS.map(num => (
              <VintageButton
                key={num}
                label={num}
                onClick={() => handleNumberPress(num)}
                variant="number"
              />
            ))}
            {/* 4 empty spacers to align with H I J K above */}
            <div className="w-5" />
            <div className="w-5" />
            <div className="w-5" />
            <div className="w-5" />
          </div>
        </div>

        {/* Navigation + LED + Actions */}
        <div className="flex flex-col gap-0.5 items-center">
          <div className="flex gap-0.5 items-center">
            <VintageButton label="▲" onClick={onNavigateUp} variant="action" disabled={!canNavigateUp} />
            <VintageButton label="▼" onClick={onNavigateDown} variant="action" disabled={!canNavigateDown} />
            <div className="w-1" />
            <LEDDisplay value={input} state={displayState} />
          </div>
          <div className="flex gap-0.5">
            <VintageButton label="CLR" onClick={handleClear} variant="action" wide />
            <VintageButton label="OK" onClick={handleEnter} variant="action" wide />
          </div>
        </div>
      </div>
    </div>
  );
}

export { LEDDisplay };
