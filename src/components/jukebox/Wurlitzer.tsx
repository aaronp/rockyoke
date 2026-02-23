import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlayState = "idle" | "sliding" | "rising" | "lifting" | "playing";

type Props = {
  triggerPlay?: boolean;
  onPlayComplete?: () => void;
  showControls?: boolean;
};

export function Wurlitzer({ triggerPlay, onPlayComplete, showControls = true }: Props) {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentRecord, setCurrentRecord] = useState(0);

  const recordStackY = (14 - currentRecord) * 8;

  const handlePlay = useCallback(() => {
    if (playState !== "idle") return;
    setPlayState("sliding");
    setTimeout(() => setPlayState("rising"), 800);
    setTimeout(() => setPlayState("lifting"), 1400);
    setTimeout(() => setPlayState("playing"), 2000);
  }, [playState]);

  // External trigger
  useEffect(() => {
    if (triggerPlay && playState === "idle") {
      handlePlay();
    }
  }, [triggerPlay, playState, handlePlay]);

  // Notify when playing completes (after ~3 seconds of playing)
  useEffect(() => {
    if (playState === "playing") {
      const timer = setTimeout(() => {
        onPlayComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [playState, onPlayComplete]);

  function handleReset() {
    setPlayState("idle");
    setCurrentRecord((r) => (r + 1) % 15);
  }

  return (
    <div className="relative w-full h-full">
      {/* Player Stage */}
      <div
        className="relative mx-auto overflow-hidden rounded-t-[100px] bg-gradient-to-b from-rose-950/80 via-neutral-950 to-neutral-900"
        style={{
          width: "100%",
          height: "100%",
          perspective: "800px",
        }}
      >
        {/* 3D Stage */}
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(15deg)",
            transformOrigin: "center 100%",
          }}
        >
          {/* Record Stack (left) */}
          <div className="absolute left-6" style={{ bottom: -40 }}>
            {[...Array(15)].map((_, i) => {
              const isTop = i === currentRecord;
              const hide = isTop && playState !== "idle";
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ bottom: (14 - i) * 8, zIndex: 15 - i }}
                  animate={{ opacity: hide ? 0 : 1 }}
                >
                  <Record isActive={isTop} />
                </motion.div>
              );
            })}
            {/* Spindle */}
            <div className="absolute bottom-0 left-1/2 h-36 w-2 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
          </div>

          {/* Sliding/Lifting Record */}
          <AnimatePresence>
            {playState !== "idle" && (
              <motion.div
                className="absolute left-6"
                style={{ zIndex: 15 - currentRecord, transform: "translateZ(0)" }}
                initial={{ x: 0, bottom: -40 + recordStackY }}
                animate={{
                  x: 210,
                  bottom: playState === "lifting" || playState === "playing"
                    ? -40 + recordStackY + 30
                    : -40 + recordStackY,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 50, damping: 12 }}
              >
                <div className={playState === "playing" ? "animate-spin-record" : ""}>
                  <Record isActive spinning={playState === "playing"} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Platter with lift column */}
          <motion.div
            className="absolute left-6"
            style={{ x: 210, transform: "translateZ(0)" }}
            initial={{ bottom: -40 }}
            animate={{
              bottom: playState === "rising"
                ? -40 + recordStackY
                : playState === "lifting" || playState === "playing"
                  ? -40 + recordStackY + 30
                  : -40,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 12 }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-48 w-6 -translate-x-1/2 rounded-b-lg bg-gradient-to-b from-neutral-500 via-neutral-600 to-neutral-700"
              style={{ boxShadow: "inset 2px 0 4px rgba(255,255,255,0.1), inset -2px 0 4px rgba(0,0,0,0.3)" }}
            />
            <div
              className="relative h-36 w-36 rounded-full bg-gradient-to-b from-neutral-600 to-neutral-800"
              style={{
                boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
                transform: "rotateX(65deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="absolute inset-2 rounded-full bg-neutral-700" />
              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500" />
            </div>
          </motion.div>

          {/* Tonearm */}
          <motion.div
            className="absolute"
            style={{
              right: 5,
              bottom: -40 + recordStackY + 110,
              zIndex: 50,
              transformOrigin: 'right center',
            }}
            animate={{ rotate: playState === "playing" ? 8 : 15 }}
            transition={{ type: "spring", stiffness: 80, damping: 12, delay: 0.2 }}
          >
            <div className="h-1.5 w-20 rounded-full bg-amber-500" />
            <div className="absolute -top-1 left-0 h-3 w-4 rounded-sm bg-amber-400" />
            <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-amber-600" />
          </motion.div>
        </div>

        {/* Floor fade */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-900 to-transparent" />
      </div>

      {/* Mini Controls */}
      {showControls && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {playState === "idle" ? (
            <Button
              onClick={handlePlay}
              size="sm"
              className="rounded-full bg-rose-600 px-3 h-8 hover:bg-rose-500"
            >
              <Play className="h-3 w-3" />
            </Button>
          ) : playState === "playing" ? (
            <Button
              onClick={handleReset}
              size="sm"
              variant="secondary"
              className="rounded-full px-3 h-8"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Record({ isActive = false, spinning = false }: { isActive?: boolean; spinning?: boolean }) {
  return (
    <div
      className={`h-36 w-36 overflow-hidden rounded-full ${isActive ? "border-2 border-rose-800/50" : "border-2 border-neutral-800/50"}`}
      style={{
        background: isActive
          ? "radial-gradient(circle, #1f1f1f 25%, #0a0a0a 70%)"
          : "radial-gradient(circle, #181818 25%, #080808 70%)",
        boxShadow: spinning
          ? "0 8px 32px rgba(0,0,0,0.8)"
          : "0 4px 16px rgba(0,0,0,0.6)",
        transform: "rotateX(65deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Groove rings */}
      {[0, 45, 90, 135].map((angle) => (
        <div
          key={angle}
          className="absolute left-1/2 top-1/2 h-0.5 w-full origin-left -translate-y-1/2"
          style={{
            transform: `rotate(${angle}deg)`,
            background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent 80%)",
          }}
        />
      ))}
      {/* Outer groove ring */}
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-700/30" />
      {/* Inner groove ring */}
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-700/20" />
      {/* Label */}
      <div
        className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isActive ? "bg-gradient-to-br from-rose-600 to-rose-800" : "bg-gradient-to-br from-amber-700 to-amber-900"
        }`}
      >
        {/* Label highlight */}
        <div className="absolute h-2 w-2 rounded-full bg-white/20" style={{ top: "25%", left: "60%" }} />
        {/* Center hole */}
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}
