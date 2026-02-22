import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlayState = "idle" | "sliding" | "rising" | "lifting" | "playing";

export default function Wurlitzer() {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentRecord, setCurrentRecord] = useState(0);

  // Calculate the vertical position of the current record in the stack
  const recordStackY = (14 - currentRecord) * 8;

  function handlePlay() {
    if (playState !== "idle") return;

    // 1. Slide record out horizontally from stack
    setPlayState("sliding");

    // 2. Platter rises to meet the record
    setTimeout(() => setPlayState("rising"), 800);

    // 3. Platter pushes record up (both move together)
    setTimeout(() => setPlayState("lifting"), 1400);

    // 4. Start playing
    setTimeout(() => setPlayState("playing"), 2000);
  }

  function handleReset() {
    setPlayState("idle");
    setCurrentRecord((r) => (r + 1) % 15);
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-xl font-semibold">Wurlitzer</h1>
        </div>

        {/* Player Stage - fits in jukebox window */}
        <div
          className="relative mx-auto overflow-hidden rounded-t-[100px] bg-gradient-to-b from-rose-950/80 via-neutral-950 to-neutral-900"
          style={{
            width: "400px",
            height: "280px",
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
            <div className="absolute bottom-12 left-6">
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
                  initial={{ x: 0, bottom: 12 + recordStackY }}
                  animate={{
                    x: 210,
                    // Record only moves up when platter is pushing it (lifting/playing)
                    bottom: playState === "lifting" || playState === "playing"
                      ? 12 + recordStackY + 30
                      : 12 + recordStackY,
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

            {/* Platter with lift column - rises to meet record, then pushes it up */}
            <motion.div
              className="absolute left-6"
              style={{ x: 210, transform: "translateZ(0)" }}
              initial={{ bottom: 12 }}
              animate={{
                // First rise to meet record, then push it up
                bottom: playState === "rising"
                  ? 12 + recordStackY  // Rise to meet the record
                  : playState === "lifting" || playState === "playing"
                    ? 12 + recordStackY + 30  // Continue rising, pushing record
                    : 12,
              }}
              transition={{ type: "spring", stiffness: 50, damping: 12 }}
            >
              {/* Lift column underneath the platter */}
              <div
                className="absolute left-1/2 top-1/2 h-48 w-6 -translate-x-1/2 rounded-b-lg bg-gradient-to-b from-neutral-500 via-neutral-600 to-neutral-700"
                style={{ boxShadow: "inset 2px 0 4px rgba(255,255,255,0.1), inset -2px 0 4px rgba(0,0,0,0.3)" }}
              />
              {/* Platter - tilted to match records */}
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

            {/* Tonearm - pivot to the right of record, arm extends left over record */}
            <motion.div
              className="absolute"
              style={{
                right: 15,
                // Vertically aligned with final record position (reduced lift)
                bottom: 12 + recordStackY + 30 + 20,
                zIndex: 50,
                transformOrigin: 'right center',
              }}
              // Headshell tilts DOWN (positive rotation), small swing from 15° to 8°
              animate={{ rotate: playState === "playing" ? 8 : 15 }}
              transition={{ type: "spring", stiffness: 80, damping: 12, delay: 0.2 }}
            >
              {/* Arm extends to the left toward record */}
              <div className="h-1.5 w-32 rounded-full bg-amber-500" />
              {/* Headshell at left end */}
              <div className="absolute -top-1 left-0 h-3 w-4 rounded-sm bg-amber-400" />
              {/* Pivot base at right */}
              <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-amber-600" />
            </motion.div>
          </div>

          {/* Floor fade */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-900 to-transparent" />
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-center gap-3">
          {playState === "idle" ? (
            <Button
              onClick={handlePlay}
              className="rounded-xl bg-rose-600 px-6 hover:bg-rose-500"
            >
              <Play className="mr-2 h-4 w-4" />
              Play
            </Button>
          ) : playState === "playing" ? (
            <Button
              onClick={handleReset}
              variant="secondary"
              className="rounded-xl"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          ) : (
            <div className="text-sm text-neutral-500 capitalize">{playState}...</div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Record tilted back to appear oval, as if viewed from the side */
function Record({ isActive = false, spinning = false, rotation = 0 }: { isActive?: boolean; spinning?: boolean; rotation?: number }) {
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
        transform: `rotateX(65deg) rotateZ(${rotation}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Radial lines/spokes for spin visibility */}
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

      {/* Groove rings */}
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-700/30" />
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-700/20" />

      {/* Label */}
      <div
        className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isActive ? "bg-gradient-to-br from-rose-600 to-rose-800" : "bg-gradient-to-br from-amber-700 to-amber-900"
        }`}
      >
        {/* Label detail - off-center dot */}
        <div
          className="absolute h-2 w-2 rounded-full bg-white/20"
          style={{ top: "25%", left: "60%" }}
        />
        {/* Center spindle hole */}
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}
