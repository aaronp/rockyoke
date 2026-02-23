// src/components/HelpTooltip.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "rockyoke-help-dismissed";

export function HelpTooltip() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the tooltip
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small delay so it appears after the page loads
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="absolute left-1/2 -translate-x-1/2 z-50"
          style={{ top: "50%" }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onClick={handleDismiss}
            className="relative cursor-pointer rounded-xl bg-white px-5 py-3 shadow-xl border-2 border-amber-400"
          >
            {/* Speech bubble tail pointing down */}
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderTop: "14px solid #fbbf24",
              }}
            />
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "12px solid white",
              }}
            />

            <p className="text-center text-sm font-semibold text-neutral-800">
              Use the{" "}
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500 text-white font-bold text-xs mx-0.5">
                ▲
              </span>{" "}
              and{" "}
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500 text-white font-bold text-xs mx-0.5">
                ▼
              </span>{" "}
              buttons
            </p>
            <p className="text-center text-sm font-semibold text-neutral-800">
              to browse songs!
            </p>
            <p className="mt-2 text-center text-xs text-neutral-400">
              tap to dismiss
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
