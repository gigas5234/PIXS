"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2, ImagePlus, RefreshCw } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RESULT_STYLES } from "@/lib/styles";

type ResultViewProps = {
  styleId: string;
};

function base64ToFile(base64: string, mimeType: string, filename: string): File {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

export function ResultView({ styleId }: ResultViewProps) {
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateProgress, setRegenerateProgress] = useState(0);
  const [currentResultUrl, setCurrentResultUrl] = useState<string | null>(null);
  const [currentStyleId, setCurrentStyleId] = useState(styleId);
  const [currentStyleTitle, setCurrentStyleTitle] = useState<string>("");
  const [selectedStyleId, setSelectedStyleId] = useState(styleId);

  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [resultImageUrlFromStorage, setResultImageUrlFromStorage] = useState<string | null>(null);
  const [signatureText, setSignatureText] = useState<string | null>(null);

  // sessionStorage는 클라이언트에서만 유효 — useEffect로 마운트 후 로드 (SSR hydration 시 null 방지)
  useEffect(() => {
    if (typeof window === "undefined") return;
    setUploadPreviewUrl(sessionStorage.getItem("pixs:uploadPreviewUrl"));
    setResultImageUrlFromStorage(sessionStorage.getItem("pixs:resultImageUrl"));
    setSignatureText(sessionStorage.getItem("pixs:signatureText"));
  }, []);

  const baseImageUrl = currentResultUrl ?? resultImageUrlFromStorage ?? uploadPreviewUrl;
  const storedStyleTitle = typeof window !== "undefined" ? sessionStorage.getItem("pixs:selectedStyleTitle") : null;
  const styleTitle = currentStyleTitle || storedStyleTitle || "선택 스타일";
  // AI가 이미지에 서명을 포함하므로 Canvas 후처리 없이 원본 사용 (노란색 중복 제거)
  const displayImageUrl = baseImageUrl;
  const resultImageUrl = baseImageUrl;

  useEffect(() => {
    setCurrentStyleId(styleId);
    setSelectedStyleId(styleId);
    const title = RESULT_STYLES.find((s) => s.id === styleId)?.title ?? sessionStorage.getItem("pixs:selectedStyleTitle");
    setCurrentStyleTitle(title ?? "");
  }, [styleId]);

  useEffect(() => {
    const t = window.setTimeout(() => setShowButtons(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  // 재생성 시 프로그레스 애니메이션
  useEffect(() => {
    if (!isRegenerating) {
      setRegenerateProgress(0);
      return;
    }
    const stepMs = 12000 / 95;
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      if (current >= 95) {
        window.clearInterval(timer);
        setRegenerateProgress(95);
        return;
      }
      setRegenerateProgress(current);
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [isRegenerating]);

  const handleResetToMain = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pixs:uploadPreviewUrl");
      sessionStorage.removeItem("pixs:resultImageUrl");
      sessionStorage.removeItem("pixs:selectedStyle");
      sessionStorage.removeItem("pixs:selectedStyleTitle");
      sessionStorage.removeItem("pixs:signatureText");
      sessionStorage.removeItem("pixs:originalImageBase64");
      sessionStorage.removeItem("pixs:originalImageMimeType");
    }
    router.push("/");
  }, [router]);

  const handleReGenerate = useCallback(async (newStyleId: string) => {
    if (isRegenerating || newStyleId === currentStyleId) return;

    const base64 = typeof window !== "undefined" ? sessionStorage.getItem("pixs:originalImageBase64") : null;
    const mimeType = typeof window !== "undefined" ? sessionStorage.getItem("pixs:originalImageMimeType") ?? "image/png" : "image/png";
    const sig = typeof window !== "undefined" ? sessionStorage.getItem("pixs:signatureText") ?? "" : "";

    if (!base64) {
      router.push("/");
      return;
    }

    setIsRegenerating(true);
    setRegenerateProgress(0);

    try {
      const file = base64ToFile(base64, mimeType, "original.png");
      const formData = new FormData();
      formData.append("image", file);
      formData.append("styleId", newStyleId);
      formData.append("signatureText", sig);

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (!data.imageUrl) throw new Error("No image returned");

      setRegenerateProgress(100);
      setCurrentResultUrl(data.imageUrl);
      setCurrentStyleId(newStyleId);
      setSelectedStyleId(newStyleId);
      setCurrentStyleTitle(RESULT_STYLES.find((s) => s.id === newStyleId)?.title ?? newStyleId);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pixs:resultImageUrl", data.imageUrl);
        sessionStorage.setItem("pixs:selectedStyle", newStyleId);
        sessionStorage.setItem("pixs:selectedStyleTitle", RESULT_STYLES.find((s) => s.id === newStyleId)?.title ?? newStyleId);
      }
    } catch {
      router.push("/");
    } finally {
      setIsRegenerating(false);
    }
  }, [isRegenerating, currentStyleId, router]);

  const handleDownload = () => {
    if (!resultImageUrl) return;
    const a = document.createElement("a");
    a.href = resultImageUrl;
    a.download = `pixs-masterpiece-${currentStyleId}.png`;
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
              <p className="mb-4 text-center text-[10px] tracking-[0.37em] text-[#d2a2aa] uppercase">
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

                {/* Artwork — 1:1 square */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-black/60">
                  <AnimatePresence>
                  {displayImageUrl ? (
                      <motion.img
                        key={currentStyleId + "-artwork"}
                        src={displayImageUrl}
                        alt={`${styleTitle} 마스터피스`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex h-full w-full items-center justify-center bg-[linear-gradient(165deg,#2b1118_0%,#101015_56%,#25121a_100%)]"
                      >
                        <p className="text-[11px] tracking-[0.33em] text-white/35 uppercase">
                          API 연결 후 생성 이미지가 표시됩니다
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 재생성 중 로딩 오버레이 */}
                  <AnimatePresence>
                    {isRegenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                      >
                        <LoadingScreen progress={regenerateProgress} className="scale-90" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="mt-4 text-center font-serif-display text-sm text-[#e8c4c9]">{styleTitle}</p>
              </motion.div>

              {/* 인라인 스타일 선택 — 가로 스크롤 (선택만, 생성은 버튼으로) */}
              <div className="mt-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {RESULT_STYLES.map((s) => {
                    const isCurrent = s.id === currentStyleId;
                    const isSelected = s.id === selectedStyleId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStyleId(s.id)}
                        disabled={isRegenerating}
                        className={`flex-none rounded-lg border px-3 py-2 text-xs font-medium transition ${
                          isSelected
                            ? "border-[#800808]/80 bg-[#800808]/20 text-[#f0c6cd]"
                            : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                        } ${isRegenerating ? "pointer-events-none opacity-50" : ""}`}
                      >
                        {s.title}
                        {isCurrent && (
                          <span className="ml-1.5 text-[10px] text-[#c9a227]/90">(현재)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* 선택한 스타일이 현재와 다를 때만 "이 스타일로 다시 그리기" 버튼 표시 */}
                {selectedStyleId !== currentStyleId && !isRegenerating && (
                  <motion.button
                    type="button"
                    onClick={() => handleReGenerate(selectedStyleId)}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#800808]/70 bg-[#800808]/25 py-2.5 text-sm font-medium text-[#f0c6cd] transition-colors hover:bg-[#800808]/35"
                  >
                    <RefreshCw size={16} />
                    {RESULT_STYLES.find((s) => s.id === selectedStyleId)?.title ?? selectedStyleId} 스타일로 다시 그리기
                  </motion.button>
                )}
              </div>

              {/* Action buttons */}
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

              {/* 새로운 사진으로 시작하기 */}
              <motion.button
                type="button"
                onClick={handleResetToMain}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-12 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white/80"
              >
                <ImagePlus size={18} />
                새로운 사진으로 시작하기
              </motion.button>
            </motion.section>
        </AnimatePresence>
      </div>
    </main>
  );
}
