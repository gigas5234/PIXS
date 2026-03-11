"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Sparkles } from "lucide-react";
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

    const promptTemplate = selectedStyleId ? getPromptByStyle(selectedStyleId) : null;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pixs:selectedStyle", selectedStyleId ?? "");
      sessionStorage.setItem("pixs:selectedStyleTitle", selectedStyle?.title ?? "");
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
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [uploadPreviewUrl]);

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-10"
      onMouseMove={(event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 24;
        const y = (event.clientY / window.innerHeight - 0.5) * 24;
        pointerX.set(x);
        pointerY.set(y);
      }}
    >
      <LoadingOverlay isVisible={isGenerating} />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 px-5 py-8 sm:px-8 lg:px-12"
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

        <div className="relative z-10 mb-10 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#800808]/45 bg-[#800808]/20 px-4 py-1.5 text-xs tracking-[0.2em] text-[#e3aab3] uppercase">
            <Sparkles size={14} />
            PIXS Studio
          </p>
          <h1 className="font-serif-display text-3xl text-[#f8ebee] sm:text-5xl lg:text-6xl">
            우리 아이의 영혼을 예술로 기록하다
          </h1>
          <p className="lux-copy mx-auto mt-5 max-w-3xl text-sm text-white/74 sm:text-base">
            거장의 터치를 더할 준비가 되셨나요? 웅장한 화풍을 선택하고 사진을 올리면, PIXS가 단 하나의 마스터피스로 완성합니다.
          </p>
        </div>

        <div className="relative z-10 mb-12 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
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
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`group relative overflow-hidden rounded-[1.2rem] border bg-black/35 p-4 text-left shadow-[0_10px_28px_rgba(18,8,10,0.4)] backdrop-blur-xl transition duration-400 ${
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

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border border-[#800808]/30 bg-[linear-gradient(160deg,rgba(38,17,20,0.72)_10%,rgba(13,12,15,0.68)_100%)] p-5 shadow-[0_20px_40px_rgba(14,6,9,0.45)]"
          >
            <p className="font-serif-display text-lg text-[#f8dde2]">스튜디오 캔버스 테이블</p>
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
                isDragOver
                  ? "border-[#9b3a49]/80 bg-[linear-gradient(165deg,rgba(128,8,8,0.26),rgba(20,16,19,0.45))]"
                  : "border-[#800808]/35 bg-[linear-gradient(165deg,rgba(30,15,18,0.58),rgba(11,11,14,0.5))]"
              }`}
            >
              <p className="lux-copy text-sm text-white/84">작품으로 만들 사진을 이곳에 놓아주세요</p>
              <p className="mt-2 text-xs text-white/56">사진 인화 테이블 위에 올리듯, 드래그 앤 드롭으로 업로드해 주세요</p>
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
          </motion.div>
        </div>

        <div className="relative z-10 mt-7 flex flex-col items-center gap-3">
          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            whileHover={canGenerate ? { scale: 1.02 } : undefined}
            className={`gold-border-glow rounded-full px-9 py-3 text-sm font-semibold tracking-wide transition ${
              canGenerate
                ? "bg-[#2a0f15]/90 text-[#f5ccd3] hover:bg-[#38111b]"
                : "cursor-not-allowed border-white/20 bg-white/8 text-white/45"
            }`}
          >
            마스터피스 생성하기
          </motion.button>
          <p className="text-xs text-white/55">스타일 선택 + 사진 업로드가 완료되면 자동으로 활성화됩니다</p>
        </div>

        <section className="relative z-10 mt-14">
          <p className="mb-3 text-center text-xs tracking-[0.2em] text-[#a95a66] uppercase">Curator Gallery</p>
          <h3 className="font-serif-display text-center text-2xl text-[#f8e6ea] sm:text-3xl">큐레이터 갤러리</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {styles.slice(0, 3).map((style) => (
              <motion.article
                key={`gallery-${style.id}`}
                whileHover={{ scale: 1.02 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3"
              >
                <div className={`aspect-[4/5] rounded-xl ${style.previewClass}`} />
                <p className="font-serif-display mt-3 text-base text-[#f2d5db]">{style.title}</p>
                <p className="lux-copy mt-1 text-xs text-white/64">{style.subtitle}</p>
              </motion.article>
            ))}
          </div>
        </section>
      </motion.section>
    </main>
  );
}
