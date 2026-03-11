"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Sparkles } from "lucide-react";
import { getPromptFileByStyle } from "@/lib/prompts/style-prompts";

type ConceptId = "atelier" | "cinematic";

type StyleItem = {
  id: string;
  title: string;
  subtitle: string;
  previewClass: string;
  concept: ConceptId;
  sampleImage?: string;
};

const styles: StyleItem[] = [
  {
    id: "rembrandt",
    title: "Rembrandt",
    subtitle: "빛과 그림자의 거장",
    concept: "atelier",
    sampleImage: "/gallery/rembrandt_sample.png",
    previewClass:
      "bg-[radial-gradient(circle_at_18%_12%,rgba(188,89,103,0.42),transparent_35%),linear-gradient(165deg,#3a141a_0%,#130f12_48%,#241218_100%)]",
  },
  {
    id: "vermeer",
    title: "Vermeer",
    subtitle: "고요한 자연광의 정수",
    concept: "atelier",
    previewClass:
      "bg-[radial-gradient(circle_at_70%_16%,rgba(218,132,149,0.4),transparent_34%),linear-gradient(155deg,#2e1419_0%,#111217_50%,#231a1f_100%)]",
  },
  {
    id: "van-gogh",
    title: "Van Gogh",
    subtitle: "역동적 붓 터치의 긴장감",
    concept: "atelier",
    previewClass:
      "bg-[radial-gradient(circle_at_24%_22%,rgba(156,56,71,0.45),transparent_36%),linear-gradient(150deg,#431621_0%,#1a1014_52%,#30131b_100%)]",
  },
  {
    id: "picasso",
    title: "Picasso",
    subtitle: "해석적 구도와 현대적 실험",
    concept: "atelier",
    previewClass:
      "bg-[radial-gradient(circle_at_82%_24%,rgba(194,96,111,0.34),transparent_36%),linear-gradient(145deg,#321319_0%,#131115_52%,#28131a_100%)]",
  },
  {
    id: "marvel-hero",
    title: "Marvel Hero",
    subtitle: "강렬한 히어로 조명의 중심",
    concept: "cinematic",
    sampleImage: "/gallery/heroic_sample.png",
    previewClass:
      "bg-[radial-gradient(circle_at_70%_16%,rgba(78,130,255,0.32),transparent_35%),linear-gradient(152deg,#111726_0%,#101118_54%,#0f1622_100%)]",
  },
  {
    id: "disney-live-action",
    title: "Disney Live-action",
    subtitle: "따뜻한 시네마틱 실사 감성",
    concept: "cinematic",
    previewClass:
      "bg-[radial-gradient(circle_at_22%_12%,rgba(80,155,245,0.28),transparent_34%),linear-gradient(152deg,#181b2d_0%,#141117_50%,#1a1f2e_100%)]",
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk",
    subtitle: "네온 대비와 미래 도시 무드",
    concept: "cinematic",
    previewClass:
      "bg-[radial-gradient(circle_at_82%_15%,rgba(79,180,255,0.35),transparent_34%),linear-gradient(152deg,#151827_0%,#100f16_50%,#131927_100%)]",
  },
  {
    id: "western",
    title: "Western",
    subtitle: "드라마틱 역광의 대서사",
    concept: "cinematic",
    previewClass:
      "bg-[radial-gradient(circle_at_26%_20%,rgba(125,156,218,0.3),transparent_35%),linear-gradient(145deg,#1a1a24_0%,#131014_51%,#202532_100%)]",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedConcept, setSelectedConcept] = useState<ConceptId>("atelier");
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

  const conceptStyles = useMemo(() => styles.filter((style) => style.concept === selectedConcept), [selectedConcept]);
  const selectedStyle = useMemo(() => styles.find((style) => style.id === selectedStyleId) ?? null, [selectedStyleId]);
  const canGenerate = Boolean(selectedStyleId && uploadedFile);
  const accentPrimary = selectedConcept === "atelier" ? "#800808" : "#4b7dd4";
  const accentSecondaryText = selectedConcept === "atelier" ? "text-[#f3c7ce]" : "text-[#d9e5ff]";

  useEffect(() => {
    setSelectedStyleId(null);
  }, [selectedConcept]);

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

    const promptTemplate = selectedStyleId ? getPromptFileByStyle(selectedStyleId) : null;
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
        <motion.div
          animate={{ opacity: selectedConcept === "atelier" ? 1 : 0 }}
          transition={{ duration: 0.7 }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(120,22,38,0.28),transparent_38%),linear-gradient(155deg,#140f12_0%,#100f12_54%,#1b1116_100%)]"
        />
        <motion.div
          animate={{ opacity: selectedConcept === "cinematic" ? 1 : 0 }}
          transition={{ duration: 0.7 }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_15%,rgba(78,130,255,0.2),transparent_35%),linear-gradient(152deg,#0f121a_0%,#101319_52%,#151a24_100%)]"
        />
        <motion.div
          animate={{ opacity: selectedConcept === "atelier" ? 0.14 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='canvas'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='3'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23canvas)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: "220px 220px",
          }}
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        />
        <motion.div
          animate={{ opacity: selectedConcept === "cinematic" ? 0.12 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: "180px 180px",
          }}
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        />
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
            당신의 반려동물, 영원히 기억될 하나의 마스터피스가 되다.
          </h1>
          <p className="lux-copy mx-auto mt-5 max-w-3xl text-sm text-white/74 sm:text-base">
            PIXS는 시간을 초월한 거장의 붓 터치와 할리우드의 웅장한 조명을 통해 당신의 가족을 예술로 기록하는 디지털 아틀리에입니다.
          </p>
        </div>

        <section className="relative z-10 mb-12">
          <div className="grid gap-4 lg:grid-cols-2">
            <motion.button
              type="button"
              onClick={() => setSelectedConcept("atelier")}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl border p-6 text-left transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                selectedConcept === "atelier"
                  ? "border-[#8e2b3a] bg-[linear-gradient(150deg,rgba(67,20,30,0.9),rgba(24,14,16,0.9))]"
                  : "border-white/12 bg-black/28 hover:border-[#8e2b3a]/55"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(167,58,74,0.34),transparent_46%)]" />
              <p className="font-serif-display relative z-10 text-2xl text-[#f7dfe3]">The Royal Atelier</p>
              <p className="lux-copy relative z-10 mt-2 text-sm text-[#f2d2d8]/78">
                17세기 유럽 궁정 화가의 작업실에서 탄생한 듯한 묵직한 고전미.
              </p>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setSelectedConcept("cinematic")}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl border p-6 text-left transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                selectedConcept === "cinematic"
                  ? "border-[#4b7dd4] bg-[linear-gradient(150deg,rgba(21,32,54,0.92),rgba(14,16,22,0.9))]"
                  : "border-white/12 bg-black/28 hover:border-[#4b7dd4]/55"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(75,125,212,0.3),transparent_44%)]" />
              <p className="font-serif-display relative z-10 text-2xl text-[#e4ebff]">Cine-Matic Paw</p>
              <p className="lux-copy relative z-10 mt-2 text-sm text-[#d8e4ff]/74">
                할리우드 영화 포스터 속 주인공이 된 듯한 웅장한 시네마틱 서사.
              </p>
            </motion.button>
          </div>
        </section>

        <div className="relative z-10 mb-12 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div>
            <h2 className="font-serif-display mb-3 text-xl text-[#f7dfe4] sm:text-2xl">
              {selectedConcept === "atelier" ? "Atelier 스타일 선택" : "Cine-Matic 스타일 선택"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {conceptStyles.map((style) => {
                const isSelected = selectedStyleId === style.id;
                const dimmed = selectedStyleId && !isSelected;

                return (
                  <motion.button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`group relative overflow-hidden rounded-[1.2rem] border bg-black/35 p-4 text-left shadow-[0_10px_28px_rgba(18,8,10,0.4)] backdrop-blur-xl transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isSelected
                        ? selectedConcept === "atelier"
                          ? "border-[#800808]/90"
                          : "border-[#4b7dd4]/90"
                        : selectedConcept === "atelier"
                          ? "border-white/10 hover:border-[#800808]/55"
                          : "border-white/10 hover:border-[#4b7dd4]/60"
                    } ${dimmed ? "opacity-50" : "opacity-100"}`}
                  >
                    <div
                      className={`absolute inset-0 scale-[1.02] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:scale-[1.06] ${style.previewClass}`}
                    />
                    {style.sampleImage && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-0 transition duration-500 group-hover:opacity-55"
                        style={{ backgroundImage: `url('${style.sampleImage}')` }}
                      />
                    )}
                    <div
                      className={`pointer-events-none absolute -inset-3 -z-10 rounded-3xl opacity-0 blur-2xl transition duration-500 group-hover:opacity-60 ${
                        selectedConcept === "atelier" ? "bg-[#800808]/35" : "bg-[#4b7dd4]/30"
                      }`}
                    />

                    <div className="relative z-10">
                      <p className="font-serif-display text-lg text-[#f8e1e6]">{style.title}</p>
                      <p className="lux-copy mt-2 text-xs text-white/72">{style.subtitle}</p>
                      {isSelected && (
                        <span
                          className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[10px] tracking-wide ${
                            selectedConcept === "atelier"
                              ? "border border-[#800808]/70 bg-[#800808]/30 text-[#f3c7ce]"
                              : "border border-[#4b7dd4]/70 bg-[#4b7dd4]/25 text-[#d9e5ff]"
                          }`}
                        >
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
            className={`rounded-2xl border p-5 shadow-[0_20px_40px_rgba(14,6,9,0.45)] ${
              selectedConcept === "atelier"
                ? "border-[#800808]/30 bg-[linear-gradient(160deg,rgba(38,17,20,0.72)_10%,rgba(13,12,15,0.68)_100%)]"
                : "border-[#4b7dd4]/35 bg-[linear-gradient(160deg,rgba(19,28,45,0.8)_10%,rgba(12,14,20,0.76)_100%)]"
            }`}
          >
            <p className="font-serif-display text-lg text-[#f8dde2]">스튜디오 캔버스 테이블</p>
            <p className="lux-copy mt-1 text-xs text-white/58">이 컨셉으로 기록할 사진 업로드</p>
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
              className={`relative mt-3 rounded-xl border px-5 py-10 text-center transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isDragOver
                  ? selectedConcept === "atelier"
                    ? "border-[#9b3a49]/80 bg-[linear-gradient(165deg,rgba(128,8,8,0.26),rgba(20,16,19,0.45))]"
                    : "border-[#4b7dd4]/70 bg-[linear-gradient(165deg,rgba(58,89,162,0.28),rgba(16,18,26,0.45))]"
                  : selectedConcept === "atelier"
                    ? "border-[#800808]/35 bg-[linear-gradient(165deg,rgba(30,15,18,0.58),rgba(11,11,14,0.5))]"
                    : "border-[#4b7dd4]/35 bg-[linear-gradient(165deg,rgba(19,26,40,0.62),rgba(11,11,14,0.5))]"
              }`}
            >
              <motion.div
                aria-hidden
                animate={
                  isDragOver
                    ? {
                        opacity: [0.15, 0.34, 0.15],
                        scale: [0.98, 1.02, 0.98],
                      }
                    : { opacity: 0, scale: 1 }
                }
                transition={{ duration: 1.2, repeat: isDragOver ? Infinity : 0, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-3 rounded-lg bg-[radial-gradient(circle_at_30%_22%,rgba(146,36,51,0.35),transparent_56%)]"
              />
              <div className="pointer-events-none absolute inset-4 rounded-md border border-white/12" />
              <p className="lux-copy text-sm text-white/84">작품으로 만들 사진을 이곳에 놓아주세요</p>
              <p className="mt-2 text-xs text-white/56">사진 인화 테이블 위에 올리듯, 드래그 앤 드롭으로 업로드해 주세요</p>
              <label className="mt-5 inline-block cursor-pointer rounded-full border border-white/20 bg-white/6 px-4 py-2 text-xs text-white/80 transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/12">
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

        <section className="relative z-10 mb-14 rounded-2xl border border-white/10 bg-black/24 px-6 py-8 text-center">
          <h3 className="font-serif-display text-2xl text-[#f7e6ea] sm:text-3xl">Brand Story</h3>
          <p className="lux-copy mx-auto mt-5 max-w-4xl text-sm text-white/75 sm:text-base">
            PIXS는 단순히 사진을 변환하는 도구가 아닙니다.
            <br />
            우리는 시간을 초월한 거장의 붓 터치와 할리우드 스튜디오의 압도적인 조명을 통해,
            <br />
            당신의 가족인 반려동물의 영혼을 예술로 기록하는 디지털 아틀리에입니다.
          </p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            className="mt-4"
          >
            {["마스터피스", "영원", "기록"].map((word) => (
              <motion.p
                key={word}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                }}
                className={`font-serif-display text-base sm:text-lg ${accentSecondaryText}`}
                style={{ color: accentPrimary }}
              >
                {word}
              </motion.p>
            ))}
          </motion.div>
        </section>

        <div className="relative z-10 mt-7 flex flex-col items-center gap-3">
          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            whileHover={canGenerate ? { scale: 1.02 } : undefined}
            className={`gold-border-glow rounded-full px-9 py-3 text-sm font-semibold tracking-wide transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            className="mt-6 grid gap-4 sm:grid-cols-3"
          >
            {styles.slice(0, 3).map((style) => (
              <motion.article
                key={`gallery-${style.id}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                }}
                whileHover={{ scale: 1.02 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              >
                <div className={`relative aspect-[4/5] overflow-hidden rounded-xl ${style.previewClass}`}>
                  {style.sampleImage && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: `url('${style.sampleImage}')` }}
                    />
                  )}
                </div>
                <p className="font-serif-display mt-3 text-base text-[#f2d5db]">{style.title}</p>
                <p className="lux-copy mt-1 text-xs text-white/64">{style.subtitle}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>
      </motion.section>
    </main>
  );
}
