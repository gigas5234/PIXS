"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { VerticalArtSlider } from "@/components/VerticalArtSlider";
import { getPromptFileByStyle } from "@/lib/prompts/style-prompts";

type ConceptId = "atelier" | "cinematic";

type StyleItem = {
  id: string;
  title: string;
  subtitle: string;
  concept: ConceptId;
};

const styles: StyleItem[] = [
  { id: "rembrandt", title: "Rembrandt", subtitle: "빛과 그림자의 거장", concept: "atelier" },
  { id: "vermeer", title: "Vermeer", subtitle: "고요한 자연광의 정수", concept: "atelier" },
  { id: "van-gogh", title: "Van Gogh", subtitle: "역동적 붓 터치의 긴장감", concept: "atelier" },
  { id: "picasso", title: "Picasso", subtitle: "해석적 구도와 현대적 실험", concept: "atelier" },
  { id: "marvel-hero", title: "Heroic", subtitle: "강렬한 히어로 조명의 중심", concept: "cinematic" },
  { id: "disney-live-action", title: "Fairytale", subtitle: "따뜻한 시네마틱 실사 감성", concept: "cinematic" },
  { id: "cyberpunk", title: "Cyberpunk", subtitle: "네온 대비와 미래 도시 무드", concept: "cinematic" },
  { id: "western", title: "Western", subtitle: "드라마틱 역광의 대서사", concept: "cinematic" },
];

const STYLE_NOTES: Record<string, string> = {
  rembrandt:
    "거장의 빛과 어둠, 키아로스쿠로 기법을 재현합니다. 한 줄기 강렬한 빛이 반려동물의 깊은 눈빛에 머물고, 나머지는 벨벳 같은 어둠 속으로 스며들어 오직 존재의 숭고함에만 집중하게 합니다.",
  vermeer:
    "북유럽의 진주 같은 온화한 측면광을 담아냅니다. 창가에서 스며드는 부드러운 빛이 털의 질감을 타고 정교하게 흐르며, 평범한 일상의 찰나를 정지된 명화의 한 장면으로 기록합니다.",
  vangogh:
    "강렬하게 요동치는 임파스토 붓 터치와 생동감 넘치는 보색 대비를 입힙니다. 반려동물의 넘치는 생명력을 후기 인상주의의 열정적인 질감으로 재해석하여 캔버스 위에 뜨겁게 각인합니다.",
  picasso:
    "대상을 해체하고 재조합하는 입체주의적 시선을 담아냅니다. 반려동물의 고유한 특징을 대담한 선과 기하학적 면으로 표현하여, 세상 어디에도 없는 독창적인 현대 미술 작품으로 승화시킵니다.",
  heroic:
    "할리우드 블록버스터의 압도적인 시네마틱 조명과 하이테크 질감을 결합합니다. 웅장한 서사의 중심에 선 우리 아이를 세상의 위협으로부터 지켜내는 강인한 영웅의 모습으로 재탄생시킵니다.",
  Fairytale:
    "실사 영화 속 한 장면 같은 몽환적인 마법의 순간을 포착합니다. 따뜻하고 부드러운 글로우 조명과 동화적 상상력을 더해, 세상에서 가장 사랑스러운 이야기 속 주인공으로 기록합니다.",
  cyberpunk:
    "미래지향적인 네온 블루와 핑크 조명을 통해 감각적인 디지털 미학을 선사합니다. 홀로그램적 반사와 차가운 금속 질감이 어우러진 미래 도시의 세련된 감성으로 반려동물을 표현합니다.",
  western:
    "거친 황야의 고독과 클래식 시네마의 묵직한 명암 대비를 재현합니다. 빛바랜 세피아 톤과 거친 필름 입자를 통해 반려동물의 묵직한 존재감과 서부 영화 속 주인공 같은 카리스마를 강조합니다.",
};

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

  const selectedStyleKey = useMemo(() => {
    if (!selectedStyleId) {
      return null;
    }
    const mapping: Record<string, string> = {
      "van-gogh": "vangogh",
      "marvel-hero": "heroic",
      "disney-live-action": "Fairytale",
    };
    return mapping[selectedStyleId] ?? selectedStyleId;
  }, [selectedStyleId]);

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
      className="relative min-h-screen overflow-hidden px-4 pb-20 pt-8 sm:px-6 lg:px-10"
      onMouseMove={(event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 22;
        const y = (event.clientY / window.innerHeight - 0.5) * 22;
        pointerX.set(x);
        pointerY.set(y);
      }}
    >
      <LoadingOverlay isVisible={isGenerating} />

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

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <VerticalArtSlider originalImage="/gallery/rembrandt_sample.png" masterpieceImage="/gallery/heroic_sample.png" />
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 my-16 rounded-2xl border border-white/10 bg-black/24 px-6 py-9 text-center"
        >
          <p className="font-serif-display mx-auto max-w-4xl text-xl leading-relaxed text-[#f4e4e8] sm:text-2xl">
            PIXS는 도구가 아닙니다. 우리 아이의 영혼을 예술로 빚어내는 아틀리에입니다.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="relative z-10"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <motion.button
              type="button"
              onClick={() => setSelectedConcept("atelier")}
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl border p-6 text-left transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                selectedConcept === "atelier"
                  ? "border-[#8e2b3a] bg-[linear-gradient(150deg,rgba(67,20,30,0.9),rgba(24,14,16,0.9))]"
                  : "border-white/12 bg-black/30 hover:border-[#8e2b3a]/55"
              }`}
            >
              <p className="font-serif-display text-2xl text-[#f7dfe3]">The Royal Atelier</p>
              <p className="lux-copy mt-2 text-sm text-[#f2d2d8]/78">17세기 유럽 궁정 화가의 작업실에서 탄생한 듯한 묵직한 고전미.</p>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setSelectedConcept("cinematic")}
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl border p-6 text-left transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                selectedConcept === "cinematic"
                  ? "border-[#4b7dd4] bg-[linear-gradient(150deg,rgba(21,32,54,0.92),rgba(14,16,22,0.9))]"
                  : "border-white/12 bg-black/30 hover:border-[#4b7dd4]/55"
              }`}
            >
              <p className="font-serif-display text-2xl text-[#e4ebff]">Cine-Matic Paw</p>
              <p className="lux-copy mt-2 text-sm text-[#d8e4ff]/74">할리우드 영화 포스터 속 주인공이 된 듯한 웅장한 시네마틱 서사.</p>
            </motion.button>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
            <div>
              <h2 className="font-serif-display mb-3 text-xl text-[#f7dfe4] sm:text-2xl">
                {selectedConcept === "atelier" ? "Atelier 스타일 선택" : "Cine-Matic 스타일 선택"}
              </h2>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              >
                {conceptStyles.map((style) => {
                  const isSelected = selectedStyleId === style.id;
                  const dimmed = selectedStyleId && !isSelected;
                  return (
                    <motion.button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyleId(style.id)}
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                      }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`group rounded-[1.2rem] border bg-[#0f1012] p-4 text-left transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isSelected
                          ? selectedConcept === "atelier"
                            ? "border-[#800808]/90 shadow-[0_0_26px_rgba(128,8,8,0.32)]"
                            : "border-[#4b7dd4]/90 shadow-[0_0_26px_rgba(75,125,212,0.28)]"
                          : selectedConcept === "atelier"
                            ? "border-white/12 hover:border-[#800808]/55"
                            : "border-white/12 hover:border-[#4b7dd4]/60"
                      } ${dimmed ? "opacity-50" : "opacity-100"}`}
                    >
                      <p className="font-serif-display text-lg text-[#f7e0e5]">{style.title}</p>
                      <p className="lux-copy mt-2 text-xs text-white/68">{style.subtitle}</p>
                    </motion.button>
                  );
                })}
              </motion.div>

              <AnimatePresence>
                {selectedStyleKey && STYLE_NOTES[selectedStyleKey] ? (
                  <motion.section
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mt-5 rounded-2xl border border-white/12 bg-black/28 px-5 py-4"
                  >
                    <p className="text-xs tracking-[0.16em] text-[#d2a2aa] uppercase">The Stylist&apos;s Note</p>
                    <p className="font-serif-display mt-3 text-sm leading-relaxed text-[#f0dde1] sm:text-base">{STYLE_NOTES[selectedStyleKey]}</p>
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl border p-5 transition-[all] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 mt-10 flex flex-col items-center gap-3"
        >
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
        </motion.div>
      </motion.section>
    </main>
  );
}
