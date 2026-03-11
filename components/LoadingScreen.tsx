"use client";

import { AnimatePresence, motion } from "framer-motion";

const PROGRESS_PHRASES: { min: number; max: number; text: string }[] = [
  { min: 0, max: 20, text: "새로운 생명의 선을 긋는 중..." },
  { min: 21, max: 50, text: "거장의 붓 끝에 영혼을 담는 중..." },
  { min: 51, max: 80, text: "압도적인 조명으로 생명력을 불어넣는 중..." },
  { min: 81, max: 100, text: "마스터피스의 마지막 마침표를 찍는 중..." },
];

function getPhraseForProgress(progress: number): string {
  const found = PROGRESS_PHRASES.find((p) => progress >= p.min && progress <= p.max);
  return found?.text ?? PROGRESS_PHRASES[0].text;
}

type LoadingScreenProps = {
  progress: number;
  className?: string;
};

const CANVAS_SIZE = 320;

export function LoadingScreen({ progress, className = "" }: LoadingScreenProps) {
  const phrase = getPhraseForProgress(progress);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`mx-auto max-w-full ${className}`}
      style={{ width: CANVAS_SIZE }}
    >
      {/* PIXS 로고 — 상단, 은은하게 깜빡임 */}
      <motion.div
        animate={{ opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 text-center"
      >
        <span
          className="font-serif-display text-2xl font-bold tracking-[0.4em] text-white"
          aria-hidden
        >
          PIXS
        </span>
      </motion.div>

      <p className="mb-4 text-center text-[10px] tracking-[0.32em] text-[#b45d69] uppercase">
        The Artist&apos;s Work
      </p>

      {/* 캔버스 — 고정 크기, 붓터치 느낌 */}
      <div
        className="relative mx-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]"
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.9), 0 20px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* 붓터치 효과 — 좌→우로 그려지는 느낌 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 진행률에 따라 채워지는 붓자국들 (세로 스트로크) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const strokeProgress = (i / 12) * 100;
            const visible = progress >= strokeProgress;
            return (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0 w-2 rounded-full"
                style={{
                  left: `${(i / 12) * 100}%`,
                  transformOrigin: "left center",
                  background: "linear-gradient(180deg, transparent 0%, rgba(128,8,8,0.25) 20%, rgba(160,48,64,0.5) 50%, rgba(128,8,8,0.25) 80%, transparent 100%)",
                  boxShadow: "0 0 6px rgba(128,8,8,0.2)",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: visible ? 1 : 0,
                  opacity: visible ? 0.9 : 0,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            );
          })}
          {/* 붓끝이 움직이는 커서 */}
          <motion.div
            className="absolute top-0 bottom-0 w-1.5 rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(180,60,80,0.6), transparent)",
              boxShadow: "0 0 12px rgba(128,8,8,0.4)",
            }}
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* 텍스트 + 프로그레스 바 — 붓터치 스타일 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6"
        style={{ width: CANVAS_SIZE }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={phrase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-center text-sm text-white/85"
          >
            {phrase}
          </motion.p>
        </AnimatePresence>

        {/* 프로그레스 바 — 붓터치 느낌 (거친 테두리) */}
        <div className="h-2 w-full overflow-hidden rounded-sm bg-[#1a0a0c] border border-white/[0.06]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#800808] via-[#a03040] to-[#800808]"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-white/35">{progress}%</p>
      </motion.div>
    </motion.section>
  );
}

export { getPhraseForProgress, PROGRESS_PHRASES };
