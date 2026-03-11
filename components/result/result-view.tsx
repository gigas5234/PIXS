"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2, RotateCcw } from "lucide-react";

const PROGRESS_PHRASES: { min: number; max: number; text: string }[] = [
  { min: 0, max: 30, text: "거장의 시선으로 반려동물의 영혼을 읽는 중..." },
  { min: 31, max: 60, text: "시간을 초월한 붓 터치를 캔버스에 담는 중..." },
  { min: 61, max: 90, text: "할리우드 스튜디오의 압도적인 조명을 조율하는 중..." },
  { min: 91, max: 100, text: "마지막 마스터피스의 서명을 새기는 중..." },
];

function getPhraseForProgress(progress: number): string {
  const found = PROGRESS_PHRASES.find((p) => progress >= p.min && progress <= p.max);
  return found?.text ?? PROGRESS_PHRASES[0].text;
}

type ResultViewProps = {
  styleId: string;
};

export function ResultView({ styleId }: ResultViewProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const [uploadPreviewUrl] = useState<string | null>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pixs:uploadPreviewUrl") : null),
  );
  const [resultImageUrlFromStorage] = useState<string | null>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pixs:resultImageUrl") : null),
  );
  const [styleTitle] = useState<string>(
    () =>
      (typeof window !== "undefined" ? sessionStorage.getItem("pixs:selectedStyleTitle") : null) ?? "선택 스타일",
  );

  // API 연결 시 pixs:resultImageUrl 사용, 미연결 시 업로드 미리보기로 대체
  const resultImageUrl = resultImageUrlFromStorage ?? uploadPreviewUrl;

  const phrase = getPhraseForProgress(progress);
  const isLoading = !isRevealed;

  useEffect(() => {
    if (!isLoading) return;

    const duration = 6500; // 총 로딩 시간 (ms)
    const steps = 60;
    const stepMs = duration / steps;
    const stepValue = 100 / steps;

    let current = 0;
    const timer = window.setInterval(() => {
      current += stepValue;
      if (current >= 100) {
        window.clearInterval(timer);
        setProgress(100);
        setTimeout(() => setIsRevealed(true), 400);
        return;
      }
      setProgress(Math.round(current));
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isRevealed) return;
    const t = window.setTimeout(() => setShowButtons(true), 2000);
    return () => window.clearTimeout(t);
  }, [isRevealed]);

  const handleDownload = () => {
    if (!resultImageUrl) return;
    const a = document.createElement("a");
    a.href = resultImageUrl;
    a.download = `pixs-masterpiece-${styleId}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!resultImageUrl) return;
    if (navigator.share) {
      try {
        const res = await fetch(resultImageUrl);
        const blob = await res.blob();
        const file = new File([blob], "pixs-masterpiece.png", { type: "image/png" });
        await navigator.share({
          title: "PIXS 마스터피스",
          text: "우리 아이의 영원한 기록",
          files: [file],
        });
      } catch {
        await navigator.clipboard.writeText(window.location.href);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0a0a0a]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Gallery wall texture + pin spotlight (visible after reveal) */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="pointer-events-none fixed inset-0"
            style={{
              background: "radial-gradient(ellipse 55% 45% at 50% 42%, rgba(128,8,8,0.12) 0%, transparent 55%)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* ═══ The Artist's Work — Loading State ═══ */
            <motion.section
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-full max-w-2xl"
            >
              <p className="mb-6 text-center text-[10px] tracking-[0.32em] text-[#b45d69] uppercase">
                The Artist&apos;s Work
              </p>

              {/* Empty canvas with smoking blur */}
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]"
                style={{
                  height: "clamp(280px, 50vw, 420px)",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.9), 0 20px 80px rgba(0,0,0,0.8)",
                }}
              >
                {/* Smoking blur — rising mist effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    animate={{
                      backgroundPosition: ["0% 100%", "0% 0%"],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 80%, rgba(180,80,95,0.25) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 50% 70%, rgba(140,50,65,0.2) 0%, transparent 45%)`,
                      backgroundSize: "100% 100%",
                    }}
                  />
                  <motion.div
                    animate={{
                      opacity: [0.15, 0.35, 0.15],
                      filter: ["blur(12px)", "blur(18px)", "blur(12px)"],
                    }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-t from-[#1a0c10] via-transparent to-transparent"
                  />
                </div>

                {/* Subtle shimmer */}
                <motion.div
                  animate={{
                    opacity: [0.02, 0.08, 0.02],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                />
              </motion.div>

              {/* Progress bar */}
              <div className="mt-8">
                <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#800808]/60 to-[#a03040]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phrase}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                    className="text-center text-sm text-white/75 sm:text-base"
                  >
                    {phrase}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-2 text-center font-mono text-[11px] text-white/35">{progress}%</p>
              </div>
            </motion.section>
          ) : (
            /* ═══ The Reveal — Result State ═══ */
            <motion.section
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mx-auto w-full max-w-3xl"
            >
              <p className="mb-4 text-center text-[10px] tracking-[0.32em] text-[#d2a2aa] uppercase">
                The Royal Reveal
              </p>
              <h1 className="font-serif-display text-center text-2xl text-[#f8e9ec] sm:text-3xl">
                PIXS가 완성한 당신의 마스터피스입니다
              </h1>

              {/* Frame + artwork */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto mt-8"
                style={{
                  padding: "clamp(12px, 2vw, 24px)",
                  background: "linear-gradient(145deg, #2a1518 0%, #1a0e10 40%, #120a0c 100%)",
                  borderRadius: "1.5rem",
                  boxShadow:
                    "0 0 0 1px rgba(128,8,8,0.4), 0 0 0 3px rgba(94,11,21,0.2), 0 0 60px rgba(128,8,8,0.25), 0 30px 90px rgba(0,0,0,0.8)",
                }}
              >
                {/* Gold inner accent */}
                <div
                  className="absolute inset-[6px] rounded-xl border border-[#c9a227]/25 pointer-events-none"
                  style={{ borderRadius: "calc(1.5rem - 6px)" }}
                />

                {/* Artwork — mist clearing reveal */}
                <div className="relative overflow-hidden rounded-xl bg-black/60" style={{ aspectRatio: "4/5" }}>
                  <AnimatePresence>
                    {resultImageUrl ? (
                      <motion.img
                        key="artwork"
                        src={resultImageUrl}
                        alt={`${styleTitle} 마스터피스`}
                        initial={{ opacity: 0, filter: "blur(20px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex h-full w-full items-center justify-center bg-[linear-gradient(165deg,#2b1118_0%,#101015_56%,#25121a_100%)]"
                      >
                        <p className="text-[11px] tracking-[0.28em] text-white/35 uppercase">
                          API 연결 후 생성 이미지가 표시됩니다
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ripple overlay (fades out) */}
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%)",
                    }}
                  />
                </div>

                <p className="mt-4 text-center font-serif-display text-sm text-[#e8c4c9]">{styleTitle}</p>
              </motion.div>

              {/* Action buttons — appear 2s after reveal */}
              <AnimatePresence>
                {showButtons && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-10 flex flex-wrap items-center justify-center gap-3"
                  >
                    <motion.button
                      type="button"
                      onClick={handleDownload}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2 rounded-full border border-[#800808]/70 bg-[#800808]/25 px-6 py-3 text-sm font-medium text-[#f0c6cd] transition-colors hover:bg-[#800808]/35"
                    >
                      <Download size={18} />
                      고화질 다운로드
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => router.push("/")}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/8 px-6 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/12"
                    >
                      <RotateCcw size={18} />
                      다른 스타일로 시도하기
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleShare}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/6 px-6 py-3 text-sm font-medium text-white/82 transition-colors hover:bg-white/10"
                    >
                      <Share2 size={18} />
                      SNS 공유하기
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
