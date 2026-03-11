"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

type VerticalArtSliderProps = {
  originalImage: string;
  masterpieceImage: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function VerticalArtSlider({ originalImage, masterpieceImage }: VerticalArtSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const split = useMotionValue(52);
  const splitSmooth = useSpring(split, { stiffness: 180, damping: 28, mass: 0.5 });
  const splitTop = useMotionTemplate`${splitSmooth}%`;
  const clipPath = useMotionTemplate`inset(${splitSmooth}% 0 0 0)`;

  return (
    <section className="relative h-[100svh] overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
      <div ref={containerRef} className="relative h-full w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${originalImage}')` }}
          aria-label="Original"
        />
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${masterpieceImage}')`, clipPath }}
          aria-label="Masterpiece"
        />

        <motion.div className="absolute left-0 right-0 z-20" style={{ top: splitTop }}>
          <div className="h-[1px] w-full bg-white/70" />
          <motion.div
            drag="y"
            dragConstraints={containerRef}
            dragElastic={0}
            onDrag={(_, info) => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) {
                return;
              }
              const next = ((info.point.y - rect.top) / rect.height) * 100;
              split.set(clamp(next, 7, 93));
            }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ["0 0 0 rgba(128,8,8,0.2)", "0 0 22px rgba(128,8,8,0.55)", "0 0 0 rgba(128,8,8,0.2)"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-0 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#800808]/75 bg-[radial-gradient(circle_at_30%_30%,#b65866_0%,#7f131f_45%,#3f0f16_100%)]"
          >
            <span className="h-2 w-2 rounded-full bg-white/80" />
          </motion.div>
        </motion.div>

        <div className="absolute left-6 top-6 z-20 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs tracking-[0.23em] text-white/78 uppercase">
          Original
        </div>
        <div className="absolute bottom-6 right-6 z-20 rounded-full border border-[#800808]/45 bg-[#800808]/22 px-3 py-1 text-xs tracking-[0.23em] text-[#f0cad0] uppercase">
          Masterpiece
        </div>
      </div>
    </section>
  );
}
