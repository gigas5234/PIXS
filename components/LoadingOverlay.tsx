"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type LoadingOverlayProps = {
  isVisible: boolean;
};

const loadingPhrases = [
  "거장의 터치를 입히는 중입니다...",
  "조명을 세팅하고 있습니다...",
  "반려동물의 분위기를 섬세하게 조율하는 중입니다...",
  "캔버스를 준비하고 있습니다...",
];

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  const [phrase, setPhrase] = useState(loadingPhrases[0]);
  const phrasePool = useMemo(() => loadingPhrases, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const interval = window.setInterval(() => {
      const next = phrasePool[Math.floor(Math.random() * phrasePool.length)];
      setPhrase(next);
    }, 1700);

    return () => window.clearInterval(interval);
  }, [isVisible, phrasePool]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-5 px-6 text-center">
            <motion.div
              animate={{ opacity: [0.48, 1, 0.48], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
              className="font-serif-display text-4xl tracking-[0.3em] text-[#a7424f] sm:text-5xl"
            >
              PIXS
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.p
                key={phrase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-sm text-white/82 sm:text-base"
              >
                {phrase}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
