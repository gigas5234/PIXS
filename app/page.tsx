"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { DualThemeSelector } from "@/components/landing/dual-theme-selector";
import { HeroSection } from "@/components/landing/hero-section";
import { LuxuryRevealStack } from "@/components/landing/luxury-reveal-stack";
import { StudioSelector } from "@/components/StudioSelector";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"hero" | "selector">("hero");
  const hideTimerRef = useRef<number | null>(null);

  const triggerLoading = useCallback((durationMs = 1800) => {
    setIsLoading(true);

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, durationMs);
  }, []);

  const handleStartCreating = useCallback(() => {
    triggerLoading(1600);
    window.setTimeout(() => setActiveSection("selector"), 420);
  }, [triggerLoading]);

  const handleExploreThemes = useCallback(() => {
    setActiveSection("selector");
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <LoadingOverlay isVisible={isLoading} />
      <div className="mx-auto max-w-6xl">
        <AnimatePresence mode="wait" initial={false}>
          {activeSection === "hero" ? (
            <motion.div
              key="hero-stage"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -38 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroSection onStartCreating={handleStartCreating} onExploreThemes={handleExploreThemes} />
            </motion.div>
          ) : (
            <motion.div
              key="selector-stage"
              initial={{ opacity: 0, y: 46 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <DualThemeSelector />
              <div id="studio-selector">
                <StudioSelector onUploadStart={() => triggerLoading(1900)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <LuxuryRevealStack />
      </div>
    </main>
  );
}
