"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2, RotateCcw } from "lucide-react";

type ResultViewProps = {
  styleId: string;
};

export function ResultView({ styleId }: ResultViewProps) {
  const signatureFontStacks: Record<string, string> = {
    // Atelier
    rembrandt: `"Cormorant Garamond", "Cormorant", "Times New Roman", serif`,
    vermeer: `"Playfair Display", "Spectral", "Georgia", serif`,
    "van-gogh": `"Great Vibes", "Dancing Script", "Brush Script MT", cursive`,
    renaissance: `"Cinzel", "Cormorant", "Bodoni Moda", serif`,
    picasso: `"Permanent Marker", "Rock Salt", "Kalam", cursive`,
    // Cinematic
    "marvel-hero": `"Oswald", "Bebas Neue", "League Spartan", sans-serif`,
    "disney-live-action": `"Allura", "Parisienne", "Nanum Pen Script", cursive`,
    cyberpunk: `"Orbitron", "Audiowide", "Rajdhani", sans-serif`,
    western: `"Special Elite", "Fredericka the Great", "Courier New", monospace`,
    "korean-minhwa": `"Nanum Myeongjo", "Song Myung", "Batang", serif`,
  };

  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);

  const [uploadPreviewUrl] = useState<string | null>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pixs:uploadPreviewUrl") : null),
  );
  const [resultImageUrlFromStorage] = useState<string | null>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pixs:resultImageUrl") : null),
  );
  const [signatureText] = useState<string | null>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pixs:signatureText") : null),
  );
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
  const [styleTitle] = useState<string>(
    () =>
      (typeof window !== "undefined" ? sessionStorage.getItem("pixs:selectedStyleTitle") : null) ?? "선택 스타일",
  );

  const baseImageUrl = resultImageUrlFromStorage ?? uploadPreviewUrl;
  // 화면에 보여줄 이미지는 AI가 생성한 원본
  const displayImageUrl = baseImageUrl;
  // 다운로드/공유용 이미지는 서명이 합성된 버전이 있으면 그것을 사용
  const resultImageUrl = signedImageUrl ?? baseImageUrl;

  useEffect(() => {
    const t = window.setTimeout(() => setShowButtons(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  // Canvas 후처리로 서명 합성
  useEffect(() => {
    if (!baseImageUrl || !signatureText || signatureText.trim().length === 0) return;
    let cancelled = false;

    const drawSignatureOnCanvas = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = baseImageUrl;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image for signature"));
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        // 평균 밝기 샘플링 (우측 하단 작은 영역)
        // 서명 영역: 10% 마진으로 확보해 이미지 콘텐츠와 겹침 방지
        const margin = Math.floor(canvas.width * 0.10);
        const sampleX = canvas.width - margin * 2;
        const sampleY = canvas.height - margin * 2;
        const sampleWidth = margin * 2;
        const sampleHeight = margin * 2;
        const sample = ctx.getImageData(
          Math.max(0, sampleX),
          Math.max(0, sampleY),
          Math.max(1, sampleWidth),
          Math.max(1, sampleHeight),
        );
        let totalLuma = 0;
        const data = sample.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          totalLuma += l;
        }
        const avgLuma = totalLuma / (data.length / 4 || 1);

        const gold = "#DAA520";
        const charcoal = "#111111";
        const color = avgLuma > 140 ? charcoal : gold;

        const fontSize = Math.max(16, Math.floor(canvas.width * 0.035));
        const fontStack =
          signatureFontStacks[styleId] ??
          `"Cormorant Garamond", "Cormorant", "Playfair Display", "Times New Roman", serif`;
        ctx.save();
        ctx.font = `${fontSize}px ${fontStack}`;
        const text = signatureText;
        const textWidth = ctx.measureText(text).width;
        const x = canvas.width - margin;
        const y = canvas.height - margin * 0.8;

        // 서명 배경: 반투명 패드로 이미지 콘텐츠와 겹쳐 보이지 않게 분리
        const padH = Math.floor(fontSize * 0.5);
        const padV = Math.floor(fontSize * 0.4);
        const bgX = x - textWidth - padH * 2;
        const bgY = y - fontSize - padV;
        const bgW = textWidth + padH * 2;
        const bgH = fontSize + padV * 2 + Math.floor(fontSize * 0.2);
        ctx.fillStyle = avgLuma > 140 ? "rgba(0,0,0,0.55)" : "rgba(20,12,8,0.65)";
        ctx.beginPath();
        ctx.rect(bgX, bgY, bgW, bgH);
        ctx.fill();

        ctx.globalAlpha = 0.92;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        // 밑줄 (언더라인) 추가로 각인된 서명 느낌 강화
        const underlineOffset = Math.floor(fontSize * 0.15);
        ctx.beginPath();
        ctx.moveTo(x - textWidth, y + underlineOffset);
        ctx.lineTo(x, y + underlineOffset);
        ctx.lineWidth = Math.max(1, Math.floor(fontSize * 0.06));
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();

        const url = canvas.toDataURL("image/png");
        if (!cancelled) {
          setSignedImageUrl(url);
        }
      } catch {
        // 실패 시 원본 이미지를 그대로 사용
        setSignedImageUrl(null);
      }
    };

    drawSignatureOnCanvas();

    return () => {
      cancelled = true;
    };
  }, [baseImageUrl, signatureText, styleId]);

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

                {/* Artwork — mist clearing reveal (1:1 square) */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-black/60">
                  <AnimatePresence>
                  {displayImageUrl ? (
                      <motion.img
                        key="artwork"
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

                  {/* 서명 애니메이션 오버레이 (우측 하단, 배경으로 겹침 방지) */}
                  {signatureText && signatureText.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1] }}
                      transition={{ duration: 1.6, delay: 0.8, ease: "easeInOut" }}
                      className="pointer-events-none absolute bottom-3 right-4 rounded px-2.5 py-1.5 text-right"
                      style={{ background: "rgba(20,12,8,0.65)" }}
                    >
                      <p className="font-serif text-[11px] text-white/90 tracking-[0.23em]">
                        {signatureText}
                      </p>
                      <div className="mt-0.5 h-px w-full bg-white/70" />
                    </motion.div>
                  )}
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
