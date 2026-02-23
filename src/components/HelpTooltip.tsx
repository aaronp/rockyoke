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
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="absolute left-1/2 -translate-x-1/2 z-50"
          style={{ top: "58%" }}
        >
          <div
            onClick={handleDismiss}
            className="relative cursor-pointer rounded-xl bg-amber-100 px-4 py-3 text-amber-950 shadow-lg"
          >
            {/* Speech bubble tail */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0"
              style={{
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "10px solid #fef3c7",
              }}
            />

            <p className="text-center text-sm font-medium">
              Use the <span className="font-bold text-amber-700">▲</span> and{" "}
              <span className="font-bold text-amber-700">▼</span> buttons to browse songs!
            </p>
            <p className="mt-1 text-center text-xs text-amber-600">
              Click to dismiss
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
