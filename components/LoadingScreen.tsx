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

/** PIXS 시그니처: 딥 레드(Crimson) & 미묘한 장밋빛 하이라이트 */
const CRIMSON = "#800808";
const CRIMSON_SOFT = "#b45d69";

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
      {/* 배경: 깊이감 있는 다크 모드 */}
      <div
        className="relative mx-auto overflow-hidden rounded-2xl border border-white/[0.06]"
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          background:
            "radial-gradient(circle at 18% 0%, rgba(180,93,105,0.22) 0%, transparent 45%), radial-gradient(circle at 80% 100%, rgba(128,8,8,0.38) 0%, rgba(5,3,8,1) 55%)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.85), 0 26px 80px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.7)",
        }}
      >
        {/* 중앙 PIXS 로고 */}
        <div className="flex h-full items-center justify-center">
          <div className="relative">
            <div className="mx-auto flex items-center justify-center">
              <span className="font-serif-display text-4xl font-bold tracking-[0.45em] text-white/92">
                PIXS
              </span>
            </div>
            {/* 로고 내부 Gradient Sweep */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 mx-auto w-full"
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
              }}
              initial={{ backgroundPositionX: "-100%" }}
              animate={{ backgroundPositionX: "200%" }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="h-10 w-full"
                style={{
                  backgroundImage: `linear-gradient(120deg, transparent 0%, ${CRIMSON_SOFT} 25%, #f0cad0 50%, ${CRIMSON_SOFT} 75%, transparent 100%)`,
                  backgroundSize: "220% 100%",
                  mixBlendMode: "screen",
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* 섬세한 Crimson 프로그레스 라인 */}
        <div className="pointer-events-none absolute bottom-6 left-7 right-7">
          <div className="h-px w-full overflow-hidden rounded-full bg-white/6">
            <motion.div
              className="h-full"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(180,93,105,0.18), ${CRIMSON_SOFT}, ${CRIMSON})`,
                boxShadow: "0 0 10px rgba(180,93,105,0.8)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>
      </div>

      {/* 하단 문구 — 은은한 페이드 인/아웃 */}
      <motion.p
        key={phrase}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: [0.35, 0.75, 0.35], y: 0 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-5 text-center text-xs text-white/80"
      >
        {phrase}
      </motion.p>
    </motion.section>
  );
}

export { getPhraseForProgress, PROGRESS_PHRASES };
