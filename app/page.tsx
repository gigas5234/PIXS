"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getPromptFileByStyle } from "@/lib/prompts/style-prompts";
import { centerCropToSquare } from "@/lib/image-utils";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { DebugLogPanel, type LogEntry } from "@/components/DebugLogPanel";

/* ─────────────────────────────────────────────
   Style data — imageSrc: null = placeholder
   To add a sample, set: imageSrc: "/gallery/<name>_sample.png"
───────────────────────────────────────────── */
type StyleDef = {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  concept: "atelier" | "cinematic";
  imageSrc: string | null;
  placeholderGradient: string;
  note: string;
};

const STYLES: StyleDef[] = [
  {
    id: "rembrandt",
    num: "01",
    title: "Rembrandt",
    subtitle: "빛과 그림자의 거장",
    concept: "atelier",
    imageSrc: "/gallery/rembrandt_sample.png",
    placeholderGradient: "radial-gradient(ellipse at 35% 25%, #3d1a0c 0%, #1a0c07 50%, #0d0808 100%)",
    note: "거장의 빛과 어둠, 키아로스쿠로 기법을 재현합니다. 한 줄기 강렬한 빛이 반려동물의 깊은 눈빛에 머물고, 나머지는 벨벳 같은 어둠 속으로 스며들어 오직 존재의 숭고함에만 집중하게 합니다.",
  },
  {
    id: "vermeer",
    num: "02",
    title: "Vermeer",
    subtitle: "고요한 자연광의 정수",
    concept: "atelier",
    imageSrc: null, // TODO: "/gallery/vermeer_sample.png"
    placeholderGradient: "radial-gradient(ellipse at 65% 30%, #1a2235 0%, #0e1522 50%, #0a0d16 100%)",
    note: "북유럽의 진주 같은 온화한 측면광을 담아냅니다. 창가에서 스며드는 부드러운 빛이 털의 질감을 타고 정교하게 흐르며, 평범한 일상의 찰나를 정지된 명화의 한 장면으로 기록합니다.",
  },
  {
    id: "van-gogh",
    num: "03",
    title: "Van Gogh",
    subtitle: "역동적 붓 터치의 긴장감",
    concept: "atelier",
    imageSrc: null, // TODO: "/gallery/vangogh_sample.png"
    placeholderGradient: "radial-gradient(ellipse at 40% 55%, #2a1f08 0%, #1a1005 50%, #0d0d07 100%)",
    note: "강렬하게 요동치는 임파스토 붓 터치와 생동감 넘치는 보색 대비를 입힙니다. 반려동물의 넘치는 생명력을 후기 인상주의의 열정적인 질감으로 재해석하여 캔버스 위에 뜨겁게 각인합니다.",
  },
  {
    id: "picasso",
    num: "04",
    title: "Picasso",
    subtitle: "입체주의·기하학적 해체",
    concept: "atelier",
    imageSrc: null,
    placeholderGradient: "radial-gradient(ellipse at 55% 22%, #2d1c10 0%, #180e08 50%, #0f0b0a 100%)",
    note: "대상을 해체하고 재조합하는 입체주의적 시선을 담아냅니다. 반려동물의 고유한 특징을 대담한 선과 기하학적 면으로 표현하여, 세상 어디에도 없는 독창적인 현대 미술 작품으로 승화시킵니다.",
  },
  {
    id: "renaissance",
    num: "05",
    title: "Renaissance",
    subtitle: "왕실의 품격, 정밀한 구도",
    concept: "atelier",
    imageSrc: null,
    placeholderGradient: "radial-gradient(ellipse at 50% 30%, #2d1c10 0%, #180e08 50%, #0f0b0a 100%)",
    note: "대칭적 구도와 화려한 벨벳·레이스로 왕실 초상화의 품격을 담아냅니다. 반려동물을 정밀한 유화 기법으로 기록합니다.",
  },
  {
    id: "marvel-hero",
    num: "06",
    title: "Heroic",
    subtitle: "강렬한 히어로 조명의 중심",
    concept: "cinematic",
    imageSrc: "/gallery/heroic_sample.png",
    placeholderGradient: "radial-gradient(ellipse at 25% 50%, #0f1835 0%, #080e20 50%, #060709 100%)",
    note: "할리우드 블록버스터의 압도적인 시네마틱 조명과 하이테크 질감을 결합합니다. 웅장한 서사의 중심에 선 우리 아이를 세상의 위협으로부터 지켜내는 강인한 영웅의 모습으로 재탄생시킵니다.",
  },
  {
    id: "disney-live-action",
    num: "07",
    title: "Fairytale",
    subtitle: "따뜻한 시네마틱 실사 감성",
    concept: "cinematic",
    imageSrc: null, // TODO: "/gallery/fairytale_sample.png"
    placeholderGradient: "radial-gradient(ellipse at 60% 30%, #201035 0%, #140a25 50%, #0a0810 100%)",
    note: "실사 영화 속 한 장면 같은 몽환적인 마법의 순간을 포착합니다. 따뜻하고 부드러운 글로우 조명과 동화적 상상력을 더해, 세상에서 가장 사랑스러운 이야기 속 주인공으로 기록합니다.",
  },
  {
    id: "cyberpunk",
    num: "08",
    title: "Cyberpunk",
    subtitle: "네온 대비와 미래 도시 무드",
    concept: "cinematic",
    imageSrc: null, // TODO: "/gallery/cyberpunk_sample.png"
    placeholderGradient: "radial-gradient(ellipse at 20% 70%, #001828 0%, #000e1a 50%, #010508 100%)",
    note: "미래지향적인 네온 블루와 핑크 조명을 통해 감각적인 디지털 미학을 선사합니다. 홀로그램적 반사와 차가운 금속 질감이 어우러진 미래 도시의 세련된 감성으로 반려동물을 표현합니다.",
  },
  {
    id: "western",
    num: "09",
    title: "Western Noir",
    subtitle: "드라마틱 역광의 대서사",
    concept: "cinematic",
    imageSrc: null, // TODO: "/gallery/western_sample.png"
    placeholderGradient: "radial-gradient(ellipse at 50% 40%, #1e1508 0%, #120c04 50%, #080604 100%)",
    note: "거친 황야의 고독과 클래식 시네마의 묵직한 명암 대비를 재현합니다. 빛바랜 세피아 톤과 거친 필름 입자를 통해 반려동물의 묵직한 존재감과 서부 영화 속 주인공 같은 카리스마를 강조합니다.",
  },
  {
    id: "korean-minhwa",
    num: "10",
    title: "Korean Minhwa",
    subtitle: "한지·오방색의 민화 정신",
    concept: "cinematic",
    imageSrc: null,
    placeholderGradient: "radial-gradient(ellipse at 50% 40%, #3d2a1a 0%, #2a1a0f 50%, #1a1208 100%)",
    note: "조선 시대 민화의 우아한 먹선과 오방색의 정수를 담아냅니다. 한지 위에 펼쳐지는 반려동물의 호원 자세와 정갈한 붓 터치는, 세대를 넘어 전해오는 한국민화의 따뜻하고 해학적인 정신을 담아냅니다.",
  },
];

/* ─────────────────────────────────────────────
   Dock Card
───────────────────────────────────────────── */
type DockCardProps = {
  style: StyleDef;
  isSelected: boolean;
  onClick: () => void;
};

function DockCard({ style, isSelected, onClick }: DockCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="relative h-[120px] w-[125px] flex-none rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-left transition-colors duration-300 hover:border-white/14 hover:bg-white/[0.05]"
    >
      {/* Shared layout — slides smoothly between selected cards (Apple-style) */}
      {isSelected && (
        <motion.div
          layoutId="dock-selection"
          className="absolute inset-0 rounded-xl border border-[#800808]/80 bg-[#800808]/12 shadow-[0_0_24px_rgba(128,8,8,0.3)]"
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
        />
      )}
      {isSelected && (
        <motion.div
          layoutId="dock-glow"
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(128,8,8,0.26), transparent 72%)" }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
        />
      )}
      <p className="relative z-10 font-mono text-[9px] tracking-[0.2em] text-white/32">{style.num}</p>
      <p className="relative z-10 font-serif-display mt-1.5 text-[13px] leading-tight text-white">{style.title}</p>
      <p className="relative z-10 lux-copy mt-1 line-clamp-2 text-[10px] text-white/46">{style.subtitle}</p>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
function now() {
  return new Date().toLocaleTimeString("ko-KR", { hour12: false });
}

export default function HomePage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("rembrandt");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiComplete, setApiComplete] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const selected = STYLES.find((s) => s.id === selectedId) ?? STYLES[0];
  const canGenerate = Boolean(uploadedFile);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "time">) => {
    setLogs((prev) => [
      ...prev,
      { ...entry, id: crypto.randomUUID(), time: now() },
    ]);
  }, []);

  const handleFileSelection = async (file: File | null) => {
    if (!file) return;
    try {
      const blob = await centerCropToSquare(file);
      const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".png") || "cropped.png", {
        type: "image/png",
      });
      setUploadedFile(croppedFile);
      const nextUrl = URL.createObjectURL(blob);
      setUploadPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextUrl;
      });
    } catch {
      setUploadedFile(file);
      const fallbackUrl = URL.createObjectURL(file);
      setUploadPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return fallbackUrl;
      });
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !uploadedFile || isGenerating) return;

    const promptTemplate = getPromptFileByStyle(selectedId);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pixs:selectedStyle", selectedId);
      sessionStorage.setItem("pixs:selectedStyleTitle", selected.title);
      sessionStorage.setItem("pixs:promptTemplate", promptTemplate ?? "");
      if (uploadPreviewUrl) sessionStorage.setItem("pixs:uploadPreviewUrl", uploadPreviewUrl);
    }

    setIsGenerating(true);
    addLog({ type: "request", message: `POST /api/generate (style: ${selectedId})` });

    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);
      formData.append("styleId", selectedId);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        addLog({
          type: "error",
          message: data.error ?? `HTTP ${res.status}`,
          detail: data.debug,
        });
        setIsGenerating(false);
        return;
      }

      if (data.imageUrl) {
        sessionStorage.setItem("pixs:resultImageUrl", data.imageUrl);
        addLog({ type: "success", message: "이미지 생성 완료" });
        setApiComplete(true);
      } else {
        addLog({ type: "error", message: "응답에 imageUrl 없음", detail: data });
        setIsGenerating(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog({ type: "error", message: msg, detail: err });
      setIsGenerating(false);
    }
  }, [canGenerate, uploadedFile, selectedId, selected.title, uploadPreviewUrl, isGenerating, addLog]);

  const handleLoadingComplete = useCallback(() => {
    setApiComplete(false);
    setIsGenerating(false);
    const styleId = typeof window !== "undefined" ? sessionStorage.getItem("pixs:selectedStyle") : null;
    router.push(`/result?style=${styleId ?? selectedId}`);
  }, [router, selectedId]);

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#080808] text-white">
      <LoadingOverlay
        isVisible={isGenerating}
        apiComplete={apiComplete}
        onComplete={handleLoadingComplete}
      />
      <DebugLogPanel
        logs={logs}
        onClear={() => setLogs([])}
      />

      {/* Ambient concept glow — shifts between wine (atelier) and blue (cinematic) */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        animate={{
          background:
            selected.concept === "atelier"
              ? "radial-gradient(ellipse 75% 60% at 22% 32%, rgba(94,11,21,0.16), transparent 60%)"
              : "radial-gradient(ellipse 75% 60% at 78% 32%, rgba(18,42,100,0.16), transparent 60%)",
        }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />

      <div className="relative z-10 px-4 pb-28 pt-8 sm:px-6 lg:px-10">

        {/* ══════════════════════════════════════
            1. Hero
        ══════════════════════════════════════ */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-6xl text-center"
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#800808]/45 bg-[#800808]/16 px-4 py-1.5 text-[11px] tracking-[0.22em] text-[#e3aab3] uppercase">
            <Sparkles size={13} />
            PIXS Studio
          </p>
          <h1 className="font-serif-display text-center text-3xl tracking-[0.06em] text-[#f8ebee] sm:text-5xl lg:text-6xl">
            반려동물,
            <br />
            그 영원한 기록.
          </h1>
          <p className="font-serif-display mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#f1d8dd]/78 sm:text-xl">
            거장의 붓 터치로 탄생하는 단 하나의 마스터피스.
          </p>
        </motion.header>

        {/* ══════════════════════════════════════
            2. Masterpiece Canvas + Stylist's Note
        ══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 max-w-6xl"
        >
          <div className="grid items-center gap-6 lg:grid-cols-[3fr_2fr]">

            {/* ── Canvas ── */}
            {/* Fixed height prevents layout shift when switching styles */}
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 0 1px rgba(0,0,0,0.9), 0 8px 60px rgba(0,0,0,0.85), 0 0 0px rgba(${selected.concept === "atelier" ? "128,8,8" : "75,125,212"},0)`,
                  `0 0 0 1px rgba(0,0,0,0.9), 0 8px 60px rgba(0,0,0,0.85), 0 0 55px rgba(${selected.concept === "atelier" ? "128,8,8" : "75,125,212"},0.22)`,
                  `0 0 0 1px rgba(0,0,0,0.9), 0 8px 60px rgba(0,0,0,0.85), 0 0 0px rgba(${selected.concept === "atelier" ? "128,8,8" : "75,125,212"},0)`,
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative aspect-square w-full max-w-[min(57vw,480px)] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0a0a]"
            >
              <div className="noise-overlay" />

              {/* Gradient background (always present, transitions between styles) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedId + "-bg"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                  style={{ background: selected.placeholderGradient }}
                />
              </AnimatePresence>

              {/* Sample image — object-contain prevents cropping */}
              <AnimatePresence mode="wait">
                {selected.imageSrc && (
                  <motion.img
                    key={selectedId + "-img"}
                    src={selected.imageSrc}
                    alt={selected.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </AnimatePresence>

              {/* Vignette — lighter so image details show */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Placeholder label */}
              {!selected.imageSrc && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <p className="text-[11px] tracking-[0.3em] text-white/14 uppercase">Sample Coming Soon</p>
                </div>
              )}

              {/* Museum plaque */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedId + "-plaque"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, delay: 0.25 }}
                  className="absolute bottom-4 left-5 right-5 flex items-end justify-between"
                >
                  <div>
                    <p className="font-serif-display text-sm font-medium leading-snug text-white/92">
                      {selected.title}
                    </p>
                    <p className="lux-copy mt-0.5 text-[10px] text-white/45">{selected.subtitle}</p>
                  </div>
                  <p className="font-mono text-[10px] text-white/30">{selected.num}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* ── Stylist's Note ── */}
            <div className="py-2 lg:py-4 lg:pl-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedId + "-note"}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="mb-3 text-[10px] tracking-[0.32em] text-[#d2a2aa] uppercase">
                    The Stylist&apos;s Note
                  </p>
                  <h2 className="font-serif-display text-3xl leading-tight text-[#f7e0e5] lg:text-[2.25rem]">
                    {selected.title}
                  </h2>
                  <p className="lux-copy mt-2 text-sm text-white/52">{selected.subtitle}</p>

                  <div className="my-5 h-px w-10 bg-[#800808]/55" />

                  <p className="font-serif-display text-sm leading-[1.85] text-[#f0dde1]/85 sm:text-[0.9375rem]">
                    {selected.note}
                  </p>

                  <p className="lux-copy mt-6 text-[10px] tracking-[0.3em] text-white/24 uppercase">
                    {selected.concept === "atelier" ? "The Royal Atelier" : "Cine-Matic Paw"}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════
            3. Category Labels + Style Dock
        ══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-6xl"
        >
          <div className="overflow-x-auto md:overflow-visible pb-2 scrollbar-hide">
            <div className="flex flex-nowrap md:flex-wrap gap-2">

              {/* Atelier group */}
              <div>
                <p className="mb-3 text-[9px] tracking-[0.32em] text-[#d2a2aa] uppercase">
                  The Classic Suite · I
                </p>
                <div className="flex gap-2.5 md:flex-wrap">
                  {STYLES.slice(0, 5).map((style) => (
                    <DockCard
                      key={style.id}
                      style={style}
                      isSelected={selectedId === style.id}
                      onClick={() => setSelectedId(style.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div className="mx-2 mt-6 flex-none self-stretch">
                <div className="h-full w-px rounded-full bg-white/[0.08]" />
              </div>

              {/* Cinematic group */}
              <div>
                <p className="mb-3 text-[9px] tracking-[0.32em] text-[#a2aad2] uppercase">
                  The Modern Gallery · II
                </p>
                <div className="flex gap-2.5 md:flex-wrap">
                  {STYLES.slice(5).map((style) => (
                    <DockCard
                      key={style.id}
                      style={style}
                      isSelected={selectedId === style.id}
                      onClick={() => setSelectedId(style.id)}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════
            4. Upload Section
        ══════════════════════════════════════ */}
        <motion.section
          id="upload-section"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl rounded-[1.8rem] border border-white/[0.09] bg-black/22 px-6 py-8 sm:px-8"
        >
          {/* Header */}
          <div className="mb-6">
            <p className="font-serif-display text-xl text-[#f8dde2]">스튜디오 캔버스 테이블</p>
            <p className="lux-copy mt-1 text-xs text-white/50">
              <span className="text-[#f0cad0]">{selected.title}</span> 스타일로 기록할 사진을 업로드하세요.
            </p>
          </div>

          {/* Drop zone — 업로드 시 미리보기가 내부에 배치됨 */}
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
            className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border px-5 py-10 text-center transition-all duration-500 ${
              isDragOver
                ? "border-[#9b3a49]/80 bg-[linear-gradient(165deg,rgba(128,8,8,0.2),rgba(20,16,19,0.38))]"
                : "border-[#800808]/22 bg-[linear-gradient(165deg,rgba(28,14,17,0.5),rgba(10,10,12,0.45))]"
            }`}
          >
            {uploadPreviewUrl ? (
              /* 업로드된 이미지 — 드롭존 내부에 적당한 크기로 배치, 클릭/드래그로 재등록 가능 */
              <label className="relative flex w-full max-w-[220px] cursor-pointer flex-col items-center">
                <div
                  className="aspect-square w-full rounded-lg border border-white/[0.1] bg-black/30 bg-cover bg-center shadow-lg"
                  style={{ backgroundImage: `url('${uploadPreviewUrl}')` }}
                />
                <span className="mt-3 inline-block rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs text-white/90 transition hover:border-white/35 hover:bg-white/10">
                  다른 사진으로 변경
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <>
                <motion.div
                  aria-hidden
                  animate={
                    isDragOver
                      ? { opacity: [0.1, 0.3, 0.1], scale: [0.98, 1.02, 0.98] }
                      : { opacity: 0, scale: 1 }
                  }
                  transition={{ duration: 1.2, repeat: isDragOver ? Infinity : 0, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-3 rounded-lg bg-[radial-gradient(circle_at_30%_22%,rgba(146,36,51,0.28),transparent_56%)]"
                />
                <div className="pointer-events-none absolute inset-4 rounded-md border border-white/[0.08]" />

                <p className="lux-copy text-sm text-white/80">작품으로 만들 사진을 이곳에 놓아주세요</p>
                <p className="mt-2 text-xs text-white/44">드래그 앤 드롭 또는 직접 파일 선택</p>

                <label className="mt-5 inline-block cursor-pointer rounded-full border border-white/16 bg-white/[0.05] px-5 py-2 text-xs text-white/75 transition-all duration-300 hover:border-white/28 hover:bg-white/10">
                  파일 선택
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null)}
                  />
                </label>
              </>
            )}
          </div>

          {/* Generate button */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <motion.button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              whileHover={canGenerate ? { scale: 1.02 } : undefined}
              className={`gold-border-glow rounded-full px-10 py-3 text-sm font-semibold tracking-wide transition-all duration-500 ${
                canGenerate
                  ? "bg-[#2a0f15]/90 text-[#f5ccd3] hover:bg-[#38111b]"
                  : "cursor-not-allowed border-white/16 bg-white/[0.05] text-white/36"
              }`}
            >
              마스터피스 생성하기
            </motion.button>
            <p className="text-xs text-white/42">
              {canGenerate
                ? `${selected.title} 스타일로 생성합니다 — 준비 완료`
                : "사진을 업로드하면 활성화됩니다"}
            </p>
          </div>
        </motion.section>

      </div>
    </main>
  );
}
