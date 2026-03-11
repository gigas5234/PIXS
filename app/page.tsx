"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { VerticalArtSlider } from "@/components/VerticalArtSlider";
import { ExhibitionGallery } from "@/components/ExhibitionGallery";
import { getPromptFileByStyle } from "@/lib/prompts/style-prompts";

type StyleItem = {
  id: string;
  title: string;
};

const STYLE_TITLES: Record<string, string> = {
  rembrandt: "Rembrandt",
  vermeer: "Vermeer",
  "van-gogh": "Van Gogh",
  picasso: "Renaissance",
  "marvel-hero": "Heroic",
  "disney-live-action": "Fairytale",
  cyberpunk: "Cyberpunk",
  western: "Western Noir",
};

export default function HomePage() {
  const router = useRouter();
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 70, damping: 20, mass: 0.6 });
  const springY = useSpring(pointerY, { stiffness: 70, damping: 20, mass: 0.6 });
  const orbTransform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0)`;

  const canGenerate = Boolean(selectedStyleId && uploadedFile);
  const selectedTitle = selectedStyleId ? (STYLE_TITLES[selectedStyleId] ?? selectedStyleId) : null;

  const handleFileSelection = (file: File | null) => {
    if (!file) return;
    setUploadedFile(file);
    const nextUrl = URL.createObjectURL(file);
    setUploadPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextUrl;
    });
  };

  const handleGenerate = () => {
    if (!canGenerate || isGenerating) return;
    setIsGenerating(true);
    const promptTemplate = selectedStyleId ? getPromptFileByStyle(selectedStyleId) : null;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pixs:selectedStyle", selectedStyleId ?? "");
      sessionStorage.setItem("pixs:selectedStyleTitle", selectedTitle ?? "");
      sessionStorage.setItem("pixs:promptTemplate", promptTemplate ?? "");
      if (uploadPreviewUrl) {
        sessionStorage.setItem("pixs:uploadPreviewUrl", uploadPreviewUrl);
      }
    }
    const delay = 3000 + Math.floor(Math.random() * 2000);
    window.setTimeout(() => {
      setIsGenerating(false);
      router.push(`/result?style=${selectedStyleId ?? ""}`);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 pb-24 pt-8 sm:px-6 lg:px-10"
      onMouseMove={(event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 22;
        const y = (event.clientY / window.innerHeight - 0.5) * 22;
        pointerX.set(x);
        pointerY.set(y);
      }}
    >
      <LoadingOverlay isVisible={isGenerating} />

      {/* ── Hero ── */}
      <motion.section
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-black/22 px-5 py-10 sm:px-8 lg:px-12"
      >
        <div className="noise-overlay" />
        <motion.div
          style={{ transform: orbTransform }}
          className="pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full bg-[#6f1b28]/30 blur-3xl"
        />
        <motion.div
          style={{ transform: orbTransform }}
          className="pointer-events-none absolute -right-14 top-1/4 h-72 w-72 rounded-full bg-[#8f2b39]/20 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mb-14 text-center"
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#800808]/45 bg-[#800808]/20 px-4 py-1.5 text-xs tracking-[0.2em] text-[#e3aab3] uppercase">
            <Sparkles size={14} />
            PIXS Studio
          </p>
          <h1 className="font-serif-display text-3xl tracking-[0.08em] text-[#f8ebee] sm:text-5xl lg:text-6xl">
            반려동물, 그 영원한 기록.
          </h1>
          <p className="font-serif-display mx-auto mt-7 max-w-3xl text-lg leading-relaxed tracking-[0.02em] text-[#f1d8dd]/92 sm:text-2xl">
            거장의 붓 터치로 탄생하는 단 하나의 마스터피스.
          </p>
        </motion.div>

        {/* Before / After slider */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <VerticalArtSlider
            originalImage="/gallery/rembrandt_sample.png"
            masterpieceImage="/gallery/heroic_sample.png"
          />
        </motion.div>

        {/* Brand statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 my-16 rounded-2xl border border-white/10 bg-black/24 px-6 py-9 text-center"
        >
          <p className="font-serif-display mx-auto max-w-4xl text-xl leading-relaxed text-[#f4e4e8] sm:text-2xl">
            PIXS는 도구가 아닙니다. 우리 아이의 영혼을 예술로 빚어내는 아틀리에입니다.
          </p>
        </motion.div>
      </motion.section>

      {/* ── Exhibition Gallery ── */}
      <section className="mx-auto mt-16 max-w-6xl lg:pr-16">
        <ExhibitionGallery
          selectedStyleId={selectedStyleId}
          onSelectStyle={setSelectedStyleId}
          uploadSectionId="upload-section"
        />
      </section>

      {/* ── Upload Section ── */}
      <motion.section
        id="upload-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
        className="mx-auto mt-8 max-w-3xl rounded-[1.8rem] border border-white/10 bg-black/26 px-6 py-8 sm:px-8"
      >
        {/* Header */}
        <div className="mb-6">
          <p className="font-serif-display text-xl text-[#f8dde2]">스튜디오 캔버스 테이블</p>
          <p className="lux-copy mt-1 text-xs text-white/55">
            {selectedTitle ? (
              <>
                <span className="text-[#f0cad0]">{selectedTitle}</span> 스타일로 기록할 사진을 업로드하세요.
              </>
            ) : (
              "위에서 스타일을 먼저 선택한 뒤 사진을 업로드하세요."
            )}
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileSelection(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`relative rounded-xl border px-5 py-10 text-center transition-all duration-500 ${
            isDragOver
              ? "border-[#9b3a49]/80 bg-[linear-gradient(165deg,rgba(128,8,8,0.22),rgba(20,16,19,0.4))]"
              : "border-[#800808]/28 bg-[linear-gradient(165deg,rgba(30,15,18,0.5),rgba(11,11,14,0.45))]"
          }`}
        >
          <motion.div
            aria-hidden
            animate={
              isDragOver
                ? { opacity: [0.12, 0.32, 0.12], scale: [0.98, 1.02, 0.98] }
                : { opacity: 0, scale: 1 }
            }
            transition={{ duration: 1.2, repeat: isDragOver ? Infinity : 0, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-3 rounded-lg bg-[radial-gradient(circle_at_30%_22%,rgba(146,36,51,0.32),transparent_56%)]"
          />
          <div className="pointer-events-none absolute inset-4 rounded-md border border-white/10" />

          <p className="lux-copy text-sm text-white/82">작품으로 만들 사진을 이곳에 놓아주세요</p>
          <p className="mt-2 text-xs text-white/50">드래그 앤 드롭 또는 직접 파일 선택</p>

          <label className="mt-5 inline-block cursor-pointer rounded-full border border-white/18 bg-white/5 px-5 py-2 text-xs text-white/78 transition-all duration-300 hover:bg-white/10">
            파일 선택
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null)}
            />
          </label>

          {uploadedFile && (
            <p className="mt-3 text-xs text-[#efbec7]">업로드됨: {uploadedFile.name}</p>
          )}
        </div>

        {/* Preview */}
        {uploadPreviewUrl && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-2">
            <div
              className="aspect-[4/3] rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url('${uploadPreviewUrl}')` }}
            />
          </div>
        )}

        {/* Generate button */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            whileHover={canGenerate ? { scale: 1.02 } : undefined}
            className={`gold-border-glow rounded-full px-10 py-3 text-sm font-semibold tracking-wide transition-all duration-500 ${
              canGenerate
                ? "bg-[#2a0f15]/90 text-[#f5ccd3] hover:bg-[#38111b]"
                : "cursor-not-allowed border-white/18 bg-white/6 text-white/40"
            }`}
          >
            마스터피스 생성하기
          </motion.button>
          <p className="text-xs text-white/48">
            {canGenerate ? "준비 완료 — 생성하기 버튼을 눌러주세요" : "스타일 선택 + 사진 업로드 후 활성화됩니다"}
          </p>
        </div>
      </motion.section>
    </main>
  );
}
