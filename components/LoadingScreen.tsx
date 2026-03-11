"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

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

/** 적당한 밝기의 랜덤 색상 팔레트 (진한 톤 지양) */
const STROKE_COLORS = [
  "rgba(232, 180, 184, 0.75)",  // soft coral
  "rgba(168, 212, 230, 0.7)",   // dusty blue
  "rgba(201, 228, 192, 0.7)",   // sage
  "rgba(226, 212, 240, 0.75)",  // lavender
  "rgba(245, 230, 200, 0.7)",   // warm gold
  "rgba(212, 165, 165, 0.7)",   // dusty rose
  "rgba(156, 180, 168, 0.7)",   // muted teal
  "rgba(218, 192, 212, 0.7)",   // dusty mauve
  "rgba(192, 210, 230, 0.65)",  // soft sky
  "rgba(230, 210, 180, 0.7)",   // warm sand
];

function random(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function createStrokeData() {
  const strokes: { type: "stroke" | "dot"; x: number; y: number; w: number; h: number; rot: number; color: string; delay: number }[] = [];
  for (let i = 0; i < 28; i++) {
    const isDot = i % 4 === 0;
    const color = STROKE_COLORS[Math.floor(random(i * 7) * STROKE_COLORS.length)];
    const delay = random(i * 13) * 9;
    if (isDot) {
      strokes.push({
        type: "dot",
        x: random(i * 2) * 85 + 5,
        y: random(i * 3) * 85 + 5,
        w: 4 + random(i * 5) * 6,
        h: 4 + random(i * 5) * 6,
        rot: 0,
        color,
        delay,
      });
    } else {
      const len = 20 + random(i * 11) * 70;
      const rot = random(i * 17) * 360;
      strokes.push({
        type: "stroke",
        x: random(i * 19) * 80 + 5,
        y: random(i * 23) * 80 + 5,
        w: 2 + random(i * 29) * 2.5,
        h: len,
        rot,
        color,
        delay,
      });
    }
  }
  return strokes;
}

export function LoadingScreen({ progress, className = "" }: LoadingScreenProps) {
  const phrase = getPhraseForProgress(progress);
  const strokeData = useMemo(() => createStrokeData(), []);

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

      {/* 캔버스 — 고정 크기, 랜덤 선/점 그어지는 느낌 */}
      <div
        className="relative mx-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]"
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.9), 0 20px 80px rgba(0,0,0,0.8)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {strokeData.map((s, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.w,
                height: s.h,
                transformOrigin: s.type === "stroke" ? "center top" : "center center",
                transform: s.type === "dot" ? "translate(-50%, -50%)" : `rotate(${s.rot}deg)`,
                borderRadius: s.type === "dot" ? "50%" : "999px",
                background: s.color,
                boxShadow: `0 0 6px ${s.color}`,
              }}
              initial={
                s.type === "stroke"
                  ? { scaleY: 0, opacity: 0 }
                  : { scale: 0, opacity: 0 }
              }
              animate={
                s.type === "stroke"
                  ? { scaleY: 1, opacity: 0.85 }
                  : { scale: 1, opacity: 0.85 }
              }
              transition={{
                delay: s.delay,
                duration: s.type === "dot" ? 0.35 : 0.55,
                ease: "easeOut",
              }}
            />
          ))}
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
