"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { DualThemeSelector } from "@/components/landing/dual-theme-selector";
import { HeroSection } from "@/components/landing/hero-section";
import { LuxuryRevealStack } from "@/components/landing/luxury-reveal-stack";
import { StudioSelector } from "@/components/StudioSelector";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
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
    window.setTimeout(() => {
      document.getElementById("studio-selector")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 700);
  }, [triggerLoading]);

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
        <HeroSection onStartCreating={handleStartCreating} />
        <DualThemeSelector />
        <div id="studio-selector">
          <StudioSelector onUploadStart={() => triggerLoading(1900)} />
        </div>
        <LuxuryRevealStack />
      </div>
    </main>
  );
}
