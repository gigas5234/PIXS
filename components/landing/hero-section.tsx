"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { MoveRight, Sparkles } from "lucide-react";

type HeroSectionProps = {
  onStartCreating?: () => void;
  onExploreThemes?: () => void;
};

export function HeroSection({ onStartCreating, onExploreThemes }: HeroSectionProps) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(pointerY, { stiffness: 60, damping: 20, mass: 0.5 });

  const orbTransform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0)`;

  const handlePointerMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 24;
    pointerX.set(x);
    pointerY.set(y);
  };

  return (
    <motion.section
      onMouseMove={handlePointerMove}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 px-6 py-18 sm:px-10 lg:px-16"
    >
      <div className="noise-overlay" />
      <motion.div
        style={{ transform: orbTransform }}
        className="pointer-events-none absolute -top-16 left-[12%] h-52 w-52 rounded-full bg-[#5e0b15]/30 blur-3xl"
      />
      <motion.div
        style={{ transform: orbTransform }}
        className="pointer-events-none absolute -right-12 top-1/3 h-64 w-64 rounded-full bg-sky-300/18 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-6 flex justify-center"
        >
          <span className="font-serif-display text-xl tracking-[0.27em] text-[#d37f89] sm:text-2xl">PIXS</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#800808]/45 bg-[#800808]/15 px-4 py-1.5 text-xs tracking-[0.25em] text-[#e2a2aa] uppercase"
        >
          <Sparkles size={14} />
          선택 + 작품 + 스튜디오
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.23, duration: 0.85 }}
          className="font-serif-display text-4xl text-[#f9f4e5] sm:text-5xl lg:text-7xl"
        >
          우리 아이의 가장 빛나는 순간, 영원한 예술이 되다
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="lux-copy mx-auto mt-6 max-w-2xl text-sm text-white/76 sm:text-base"
        >
          PIXS가 선택한 프리미엄 무드로 단 하나의 마스터피스를 완성합니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={onStartCreating}
            className="gold-border-glow inline-flex items-center gap-2 rounded-full bg-[#2a0f15]/82 px-7 py-3 text-sm font-semibold tracking-wide text-[#f4c8cf] transition hover:bg-[#360f18]"
          >
            시작하기
            <MoveRight size={16} />
          </button>
          <button
            type="button"
            onClick={onExploreThemes}
            className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm text-white/80 transition hover:border-white/40 hover:bg-white/10"
          >
            스타일 둘러보기
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
