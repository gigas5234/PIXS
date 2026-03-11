"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LoadingScreen } from "./LoadingScreen";

const PROGRESS_DURATION_MS = 12000;
const PROGRESS_MAX = 95;

type LoadingOverlayProps = {
  isVisible: boolean;
  apiComplete: boolean;
  onComplete: () => void;
};

/** 0→95% (12초), API 완료 시 100%로 완성 후 onComplete */
export function LoadingOverlay({ isVisible, apiComplete, onComplete }: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const hasCalledComplete = useRef(false);

  // 0→95% over 7 seconds
  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const stepMs = PROGRESS_DURATION_MS / PROGRESS_MAX;
    let current = 0;

    const timer = window.setInterval(() => {
      current += 1;
      if (current >= PROGRESS_MAX) {
        window.clearInterval(timer);
        setProgress(PROGRESS_MAX);
        return;
      }
      setProgress(current);
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [isVisible]);

  // API 완료 시 100%로 애니메이션 후 onComplete
  useEffect(() => {
    if (!apiComplete || !isVisible || hasCalledComplete.current) return;

    setProgress(100);

    const t = window.setTimeout(() => {
      hasCalledComplete.current = true;
      onComplete();
    }, 600);

    return () => window.clearTimeout(t);
  }, [apiComplete, isVisible, onComplete]);

  useEffect(() => {
    if (!isVisible) hasCalledComplete.current = false;
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center justify-center px-6">
            <LoadingScreen progress={progress} />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
