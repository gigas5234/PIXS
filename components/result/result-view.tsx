"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2, RotateCcw } from "lucide-react";

type ResultViewProps = {
  styleId: string;
};

export function ResultView({ styleId }: ResultViewProps) {
  const router = useRouter();
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

  const resultImageUrl = resultImageUrlFromStorage ?? uploadPreviewUrl;

  useEffect(() => {
    const t = window.setTimeout(() => setShowButtons(true), 800);
    return () => window.clearTimeout(t);
  }, []);

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
      {/* Gallery wall texture + pin spotlight */}
      <AnimatePresence>
        {resultImageUrl && (
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
        <AnimatePresence>
          <motion.section
              key="result"
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

                {/* Artwork — mist clearing reveal (1:1 square) */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-black/60">
                  <AnimatePresence>
                    {resultImageUrl ? (
                      <motion.img
                        key="artwork"
                        src={resultImageUrl}
                        alt={`${styleTitle} 마스터피스`}
                        initial={{ opacity: 0, filter: "blur(20px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full w-full object-cover"
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
        </AnimatePresence>
      </div>
    </main>
  );
}
