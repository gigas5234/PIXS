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

/** PIXS 시그니처: 딥 레드(Crimson) & 골드(Ochre) */
const CRIMSON = "#800808";
const CRIMSON_LIGHT = "rgba(139, 0, 0, 0.6)";
const OCHRE = "#C8953D";
const OCHRE_LIGHT = "rgba(212, 168, 75, 0.5)";

/** 캔버스 질감 — CSS 패턴 (유화 캔버스 느낌) */
const canvasTextureStyle = {
  backgroundImage: `
    repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.04) 2px),
    repeating-linear-gradient(0deg, transparent 0, transparent 1px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.04) 2px),
    repeating-linear-gradient(45deg, transparent 0, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 3px)
  `,
};

export function LoadingScreen({ progress, className = "" }: LoadingScreenProps) {
  const phrase = getPhraseForProgress(progress);
  const isFinalPhase = progress >= 80;
  const strokeDuration = isFinalPhase ? 0.25 : 0.6;

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
        animate={{ opacity: [0.15, 0.35, 0.15] }}
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

      {/* 캔버스 — 거장의 붓 터치 (Master&apos;s Brushstroke) */}
      <div
        className="relative mx-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]"
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.9), 0 20px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* 1. Ink Spread — 중앙에서 번지는 물감 효과 (Crimson → Ochre) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            opacity: 0.4 + (progress / 100) * 0.35,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: 60 + (progress / 100) * 180,
              height: 60 + (progress / 100) * 180,
              background: `radial-gradient(circle, ${OCHRE_LIGHT} 0%, ${CRIMSON_LIGHT} 40%, transparent 70%)`,
              boxShadow: `0 0 40px ${CRIMSON_LIGHT}, 0 0 80px ${OCHRE_LIGHT}`,
            }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>

        {/* 2. SVG Brush Strokes — 유려한 붓 터치 */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 320 320"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={CRIMSON} stopOpacity={0.9} />
              <stop offset="50%" stopColor={OCHRE} stopOpacity={0.85} />
              <stop offset="100%" stopColor={CRIMSON} stopOpacity={0.9} />
            </linearGradient>
          </defs>
          {/* 붓 터치 경로들 — pathLength로 그려지는 연출 */}
          <motion.path
            d="M 40 160 Q 100 80 160 120 T 280 140"
            stroke="url(#brushGradient)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(1, progress / 35) }}
            transition={{ duration: strokeDuration, ease: "easeOut" }}
          />
          <motion.path
            d="M 60 220 Q 140 180 200 200 T 260 260"
            stroke="url(#brushGradient)"
            strokeWidth="2.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(1, Math.max(0, (progress - 20) / 40)) }}
            transition={{ duration: strokeDuration, ease: "easeOut" }}
          />
          <motion.path
            d="M 80 100 Q 160 60 220 100"
            stroke="url(#brushGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(1, Math.max(0, (progress - 40) / 35)) }}
            transition={{ duration: strokeDuration, ease: "easeOut" }}
          />
          <motion.path
            d="M 100 250 Q 180 220 240 240"
            stroke="url(#brushGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(1, Math.max(0, (progress - 60) / 30)) }}
            transition={{ duration: strokeDuration, ease: "easeOut" }}
          />
        </svg>

        {/* 3. 캔버스 질감 오버레이 — 진행률에 따라 불투명도 증가 */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={canvasTextureStyle}
          initial={false}
          animate={{ opacity: (progress / 100) * 0.5 }}
          transition={{ duration: 0.3 }}
        />
        {/* public/texture.jpg — 거친 유화 캔버스 질감 (선택, 추가 시 사용, 없으면 CSS 패턴만) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/texture.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ opacity: (progress / 100) * 0.45, display: "none" }}
          onLoad={(e) => {
            (e.target as HTMLImageElement).style.display = "block";
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* 텍스트 + 프로그레스 바 */}
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

        {/* 프로그레스 바 — Crimson & Ochre 그라데이션 */}
        <div className="h-2 w-full overflow-hidden rounded-sm border border-white/[0.06] bg-[#1a0a0c]">
          <motion.div
            className="h-full"
            style={{
              background: `linear-gradient(90deg, ${CRIMSON}, ${OCHRE}, ${CRIMSON})`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: isFinalPhase ? 0.15 : 0.25 }}
          />
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-white/35">{progress}%</p>
      </motion.div>
    </motion.section>
  );
}

export { getPhraseForProgress, PROGRESS_PHRASES };
