"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Download, Share2, Sparkles } from "lucide-react";
import { getPromptByStyle } from "@/lib/prompts/style-prompts";

type StyleItem = {
  id: string;
  title: string;
  subtitle: string;
  previewClass: string;
};

const styles: StyleItem[] = [
  {
    id: "rembrandt",
    title: "Rembrandt",
    subtitle: "빛과 그림자의 거장",
    previewClass:
      "bg-[radial-gradient(circle_at_18%_12%,rgba(188,89,103,0.42),transparent_35%),linear-gradient(165deg,#3a141a_0%,#130f12_48%,#241218_100%)]",
  },
  {
    id: "vermeer",
    title: "Vermeer",
    subtitle: "고요한 자연광의 정수",
    previewClass:
      "bg-[radial-gradient(circle_at_70%_16%,rgba(218,132,149,0.4),transparent_34%),linear-gradient(155deg,#2e1419_0%,#111217_50%,#231a1f_100%)]",
  },
  {
    id: "van-gogh",
    title: "Van Gogh",
    subtitle: "역동적 붓 터치의 긴장감",
    previewClass:
      "bg-[radial-gradient(circle_at_24%_22%,rgba(156,56,71,0.45),transparent_36%),linear-gradient(150deg,#431621_0%,#1a1014_52%,#30131b_100%)]",
  },
  {
    id: "picasso",
    title: "Picasso",
    subtitle: "해석적 구도와 현대적 실험",
    previewClass:
      "bg-[radial-gradient(circle_at_82%_24%,rgba(194,96,111,0.34),transparent_36%),linear-gradient(145deg,#321319_0%,#131115_52%,#28131a_100%)]",
  },
  {
    id: "marvel-hero",
    title: "Marvel Hero",
    subtitle: "강렬한 히어로 조명의 중심",
    previewClass:
      "bg-[radial-gradient(circle_at_70%_16%,rgba(178,52,70,0.46),transparent_35%),linear-gradient(152deg,#280f19_0%,#101118_54%,#21111a_100%)]",
  },
  {
    id: "disney-live-action",
    title: "Disney Live-action",
    subtitle: "따뜻한 시네마틱 실사 감성",
    previewClass:
      "bg-[radial-gradient(circle_at_22%_12%,rgba(205,118,131,0.36),transparent_34%),linear-gradient(152deg,#34121c_0%,#141117_50%,#24141c_100%)]",
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk",
    subtitle: "네온 대비와 미래 도시 무드",
    previewClass:
      "bg-[radial-gradient(circle_at_82%_15%,rgba(186,66,87,0.42),transparent_34%),linear-gradient(152deg,#270e17_0%,#100f16_50%,#1b1018_100%)]",
  },
  {
    id: "western",
    title: "Western",
    subtitle: "드라마틱 역광의 대서사",
    previewClass:
      "bg-[radial-gradient(circle_at_26%_20%,rgba(163,65,77,0.42),transparent_35%),linear-gradient(145deg,#2f1218_0%,#131014_51%,#241219_100%)]",
  },
];

export default function HomePage() {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResultReady, setIsResultReady] = useState(false);

  const selectedStyle = useMemo(() => styles.find((style) => style.id === selectedStyleId) ?? null, [selectedStyleId]);
  const canGenerate = Boolean(selectedStyleId && uploadedFile);

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      return;
    }
    setUploadedFile(file);
    const nextUrl = URL.createObjectURL(file);
    setUploadPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return nextUrl;
    });
  };

  const handleGenerate = () => {
    if (!canGenerate || isGenerating) {
      return;
    }
    setIsGenerating(true);
    const delay = 3000 + Math.floor(Math.random() * 2000);
    window.setTimeout(() => {
      setIsGenerating(false);
      setIsResultReady(true);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [uploadPreviewUrl]);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <LoadingOverlay isVisible={isGenerating} />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-black/20 px-5 py-8 sm:px-8 lg:px-12"
      >
        <div className="mb-7 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#800808]/45 bg-[#800808]/20 px-4 py-1.5 text-xs tracking-[0.2em] text-[#e3aab3] uppercase">
            <Sparkles size={14} />
            PIXS Studio
          </p>
          <h1 className="font-serif-display text-2xl text-[#f8ebee] sm:text-4xl">
            우리 아이의 가장 빛나는 순간, 영원한 예술이 되다
          </h1>
          <p className="lux-copy mx-auto mt-4 max-w-3xl text-sm text-white/74 sm:text-base">
            거장의 터치를 더할 준비가 되셨나요? 스타일을 고르고 사진을 올리면, 바로 마스터피스를 완성합니다.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div>
            <h2 className="font-serif-display mb-3 text-xl text-[#f7dfe4] sm:text-2xl">스타일 선택</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {styles.map((style) => {
                const isSelected = selectedStyleId === style.id;
                const dimmed = selectedStyleId && !isSelected;

                return (
                  <motion.button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    whileHover={{ y: -3 }}
                    className={`group relative overflow-hidden rounded-2xl border bg-black/40 p-4 text-left backdrop-blur-xl transition duration-400 ${
                      isSelected ? "border-[#800808]/90" : "border-white/10 hover:border-[#800808]/55"
                    } ${dimmed ? "opacity-50" : "opacity-100"}`}
                  >
                    <div
                      className={`absolute inset-0 scale-[1.02] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:scale-[1.06] ${style.previewClass}`}
                    />
                    <div className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-[#800808]/35 opacity-0 blur-2xl transition duration-500 group-hover:opacity-60" />

                    <div className="relative z-10">
                      <p className="font-serif-display text-lg text-[#f8e1e6]">{style.title}</p>
                      <p className="lux-copy mt-2 text-xs text-white/72">{style.subtitle}</p>
                      {isSelected && (
                        <span className="mt-3 inline-block rounded-full border border-[#800808]/70 bg-[#800808]/30 px-2.5 py-1 text-[10px] tracking-wide text-[#f3c7ce]">
                          선택됨
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#800808]/30 bg-black/30 p-5">
            <p className="font-serif-display text-lg text-[#f8dde2]">사진 업로드</p>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragOver(false);
                const file = event.dataTransfer.files?.[0] ?? null;
                handleFileSelection(file);
              }}
              className={`mt-3 rounded-xl border px-5 py-10 text-center transition ${
                isDragOver ? "border-[#800808]/70 bg-[#800808]/16" : "border-[#800808]/35 bg-black/35"
              }`}
            >
              <p className="lux-copy text-sm text-white/80">사진을 이곳에 끌어다 놓으세요</p>
              <p className="mt-2 text-xs text-white/56">예술로 기록할 반려동물의 사진을 업로드해 주세요</p>
              <label className="mt-5 inline-block cursor-pointer rounded-full border border-white/20 bg-white/6 px-4 py-2 text-xs text-white/80 hover:bg-white/12">
                파일 선택
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
                />
              </label>
              {uploadedFile && <p className="mt-3 text-xs text-[#efbec7]">업로드됨: {uploadedFile.name}</p>}
            </div>

            {uploadPreviewUrl && (
              <div className="mt-4 rounded-lg border border-white/10 bg-black/35 p-2">
                <div className="aspect-[4/3] rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${uploadPreviewUrl}')` }} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className={`gold-border-glow rounded-full px-9 py-3 text-sm font-semibold tracking-wide transition ${
              canGenerate
                ? "bg-[#2a0f15]/90 text-[#f5ccd3] hover:bg-[#38111b]"
                : "cursor-not-allowed border-white/20 bg-white/8 text-white/45"
            }`}
          >
            마스터피스 생성하기
          </button>
          <p className="text-xs text-white/55">스타일 선택 + 사진 업로드가 완료되면 자동으로 활성화됩니다</p>
        </div>

        <AnimatePresence>
          {isResultReady && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.5 }}
              className="mt-10 rounded-3xl border border-white/10 bg-black/22 p-5"
            >
              <p className="text-center text-xs tracking-[0.2em] text-[#b45d69] uppercase">Result</p>
              <h2 className="font-serif-display mt-2 text-center text-2xl text-[#f8e9ec] sm:text-3xl">
                PIXS가 완성한 당신의 마스터피스입니다
              </h2>
              <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-[#800808]/35 bg-[#140f12] p-4 shadow-[0_30px_90px_rgba(8,4,7,0.7)]">
                <div
                  className={`aspect-[4/5] w-full rounded-2xl border border-white/10 ${
                    selectedStyle?.previewClass ?? "bg-[linear-gradient(165deg,#2b1118_0%,#101015_56%,#25121a_100%)]"
                  }`}
                >
                  {uploadPreviewUrl && (
                    <div
                      className="h-full w-full bg-cover bg-center mix-blend-screen opacity-40"
                      style={{ backgroundImage: `url('${uploadPreviewUrl}')` }}
                    />
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[#800808]/60 bg-[#800808]/24 px-5 py-2.5 text-sm text-[#f0c6cd]"
                >
                  <Download size={16} />
                  다운로드
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/6 px-5 py-2.5 text-sm text-white/82"
                >
                  <Share2 size={16} />
                  공유하기
                </button>
              </div>
              {selectedStyleId && (
                <p className="mt-5 text-center text-xs text-white/50">
                  선택된 스타일: {selectedStyle?.title} / 프롬프트 연결: {getPromptByStyle(selectedStyleId) ? "완료" : "미연결"}
                </p>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}
