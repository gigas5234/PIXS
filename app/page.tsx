import { DualThemeSelector } from "@/components/landing/dual-theme-selector";
import { HeroSection } from "@/components/landing/hero-section";
import { LuxuryRevealStack } from "@/components/landing/luxury-reveal-stack";
import { StudioSelector } from "@/components/StudioSelector";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HeroSection />
        <DualThemeSelector />
        <StudioSelector />
        <LuxuryRevealStack />
      </div>
    </main>
  );
}
