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

export function LoadingScreen({ progress, className = "" }: LoadingScreenProps) {
  const phrase = getPhraseForProgress(progress);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`mx-auto w-full max-w-2xl ${className}`}
    >
      <p className="mb-6 text-center text-[10px] tracking-[0.32em] text-[#b45d69] uppercase">
        The Artist&apos;s Work
      </p>

      {/* Canvas container — appears first */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto w-full max-w-[min(50vw,420px)]"
      >
        {/* PIXS 로고 워터마크 — 캔버스 뒤 배경, 은은하게 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <span
            className="font-serif-display text-[clamp(4rem,15vw,8rem)] font-bold tracking-[0.4em] text-white/[0.04]"
            aria-hidden
          >
            PIXS
          </span>
        </motion.div>

        {/* Empty canvas with smoke + 그려지는 효과 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]"
          style={{
            boxShadow: "0 0 0 1px rgba(0,0,0,0.9), 0 20px 80px rgba(0,0,0,0.8)",
            zIndex: 1,
          }}
        >
          {/* Smoking blur — rising mist (연기 효과 유지) */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                backgroundPosition: ["0% 100%", "0% 0%"],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 80%, rgba(180,80,95,0.35) 0%, transparent 50%),
                  radial-gradient(ellipse 60% 40% at 50% 70%, rgba(140,50,65,0.3) 0%, transparent 45%)`,
                backgroundSize: "100% 100%",
              }}
            />
            <motion.div
              animate={{
                opacity: [0.2, 0.45, 0.2],
                filter: ["blur(12px)", "blur(18px)", "blur(12px)"],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-t from-[#1a0c10] via-transparent to-transparent"
            />
          </div>

          {/* 그려지는 듯한 효과 — 확실하게 보이도록 강화 */}
          <motion.div
            animate={{
              opacity: [0.08, 0.25, 0.08],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[15%] rounded-full"
            style={{
              background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(200,100,110,0.4) 0%, transparent 70%)",
              boxShadow: "inset 0 0 60px rgba(128,8,8,0.15)",
            }}
          />
          <motion.div
            animate={{
              opacity: [0.03, 0.15, 0.03],
              x: ["-100%", "100%"],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{ width: "60%" }}
          />
        </motion.div>

        {/* 텍스트 + 프로그레스 바 — 0.5초 뒤 페이드인, 캔버스 너비와 동일 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 w-full max-w-[min(50vw,420px)]"
        >
          {/* 문구: 프로그레스 바 바로 위 중앙 고정 */}
          <AnimatePresence mode="wait">
            <motion.p
              key={phrase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="mb-4 text-center text-sm text-white/85 sm:text-base"
            >
              {phrase}
            </motion.p>
          </AnimatePresence>

          {/* 프로그레스 바 — 캔버스 너비와 동일 */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#800808]/70 to-[#a03040]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="mt-2 text-center font-mono text-[11px] text-white/35">{progress}%</p>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

export { getPhraseForProgress, PROGRESS_PHRASES };
