"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LoadingScreen } from "./LoadingScreen";

type LoadingOverlayProps = {
  isVisible: boolean;
};

/** API 호출 중 표시되는 통합 로딩 뷰. 0~90% 시뮬레이션 진행. */
export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const duration = 30000; // 30초에 90%까지
    const steps = 90;
    const stepMs = duration / steps;

    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      if (current >= 90) {
        window.clearInterval(timer);
        setProgress(90);
        return;
      }
      setProgress(current);
    }, stepMs);

    return () => window.clearInterval(timer);
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
