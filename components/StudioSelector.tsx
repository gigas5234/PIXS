"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Upload, WandSparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type StyleCategory = "atelier" | "cinematic";

type SubStyle = {
  id: string;
  title: string;
  description: string;
  promptTemplate?: string;
};

type StudioSelectorProps = {
  onUploadStart?: () => void;
};

const stylistNotes: Record<string, string> = {
  rembrandt:
    "17세기 거장의 키아로스쿠로 기법을 재현합니다. 강렬한 빛과 깊은 그림자 속에 반려동물의 고귀한 눈빛을 담아냅니다.",
  "marvel-hero":
    "할리우드 시네마틱 조명과 하이테크 질감을 결합합니다. 평범한 일상을 넘어 웅장한 서사의 주인공으로 재탄생시킵니다.",
};

const subStyleCatalog: Record<StyleCategory, SubStyle[]> = {
  atelier: [
    { id: "rembrandt", title: "Rembrandt", description: "빛과 그림자의 강렬한 대비" },
    { id: "vermeer", title: "Vermeer", description: "부드러운 자연광과 고요한 미술관의 분위기." },
    { id: "van-gogh", title: "Van Gogh", description: "살아 움직이는 듯한 역동적인 붓 터치" },
    { id: "picasso", title: "Picasso", description: "현대적 구도와 예술적 해석이 강조된 초상." },
  ],
  cinematic: [
    { id: "marvel-hero", title: "Heroic", description: "히어로 포스터 스타일의 강렬한 조명과 실루엣." },
    { id: "disney-live-action", title: "Disney Live-action", description: "따뜻하고 영화적인 실사 텍스처 중심 연출." },
    { id: "cyberpunk", title: "Cyberpunk", description: "네온 하이라이트와 미래 도시의 고대비 무드." },
    { id: "western", title: "Western", description: "영화적인 먼지빛 톤과 드라마틱한 역광." },
  ],
};

export function StudioSelector({ onUploadStart }: StudioSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory>("atelier");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleStyles = useMemo(() => subStyleCatalog[selectedCategory], [selectedCategory]);

  const selectedStyle = useMemo(
    () => visibleStyles.find((style) => style.id === selectedStyleId) ?? null,
    [visibleStyles, selectedStyleId],
  );
  const hasSelection = selectedStyleId !== null;

  const triggerUpload = () => {
    onUploadStart?.();
    fileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const onPickCategory = (category: StyleCategory) => {
    setSelectedCategory(category);
    setSelectedStyleId(null);
    setFileName("");
  };

  return (
    <section className="mt-14 rounded-[1.8rem] border border-white/10 bg-white/[0.02] px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-7 text-center">
        <p className="text-xs tracking-[0.2em] text-[#a7424f]/85 uppercase">Studio Selector</p>
        <h2 className="font-serif-display mt-3 text-3xl text-[#f9e8eb] sm:text-4xl">당신의 스타일을 선택하세요</h2>
        <p className="lux-copy mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
          선택한 메인 컨셉에 맞춰 세부 작가/장르 스타일을 고르고, 이후 AI 프롬프트 주입이 가능한 구조로 확장됩니다.
        </p>
      </div>

      <div className="mx-auto mb-7 grid max-w-2xl grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/30 p-2">
        <button
          type="button"
          onClick={() => onPickCategory("atelier")}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            selectedCategory === "atelier"
              ? "bg-[#800808]/26 text-[#f4c8cf]"
              : "bg-transparent text-white/65 hover:bg-white/5"
          }`}
        >
          Royal Atelier
        </button>
        <button
          type="button"
          onClick={() => onPickCategory("cinematic")}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            selectedCategory === "cinematic"
              ? "bg-[#800808]/26 text-[#f4c8cf]"
              : "bg-transparent text-white/65 hover:bg-white/5"
          }`}
        >
          Cine-Matic
        </button>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1 } },
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {visibleStyles.map((style) => {
          const isSelected = selectedStyleId === style.id;
          return (
            <motion.button
              key={style.id}
              type="button"
              onClick={() => setSelectedStyleId(style.id)}
              initial={{ opacity: 0, y: 20 }}
              variants={{
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
              }}
              whileHover={{ y: -4, scale: 1.01 }}
              animate={
                isSelected
                  ? {
                      boxShadow: [
                        "0 0 0 rgba(94, 11, 21, 0.0)",
                        "0 0 22px rgba(128, 8, 8, 0.35)",
                        "0 0 14px rgba(128, 8, 8, 0.28)",
                      ],
                    }
                  : { boxShadow: "0 0 0 rgba(94, 11, 21, 0)" }
              }
              transition={{ duration: 1.6, repeat: isSelected ? Infinity : 0, ease: "easeInOut" }}
              className={`group relative overflow-hidden rounded-2xl border bg-[#101113] p-4 text-left transition duration-400 ${
                isSelected ? "border-[#800808]/85" : "border-white/10 hover:border-[#800808]/55"
              } ${hasSelection && !isSelected ? "opacity-50" : "opacity-100"}`}
            >
              <div className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-[#800808]/25 opacity-0 blur-2xl transition duration-500 group-hover:opacity-45" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif-display text-lg text-[#f8dde2]">{style.title}</h3>
                  <AnimatePresence>
                    {isSelected ? (
                      <motion.span
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="inline-flex items-center gap-1 rounded-full border border-[#800808]/55 bg-[#800808]/28 px-2 py-1 text-[10px] tracking-wide text-[#f5c9cf]"
                      >
                        <Check size={12} />
                        선택됨
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>

                <p className="lux-copy mt-2 text-xs text-white/72">{style.description}</p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {selectedStyle ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45 }}
            className="mt-8 space-y-4"
          >
            <section className="rounded-2xl border border-[#800808]/35 bg-black/28 px-5 py-4">
              <p className="text-xs tracking-[0.18em] text-[#ce8993] uppercase">The Stylist&apos;s Note</p>
              <p className="font-serif-display mt-3 text-sm leading-relaxed text-[#f2d8dc] sm:text-base">
                {stylistNotes[selectedStyle.id] ?? `${selectedStyle.title} 스타일로 고유한 조명과 질감을 정교하게 적용합니다.`}
              </p>
            </section>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
              aria-label="반려동물 이미지 업로드"
            />

            <section className="rounded-2xl border border-[#800808]/45 bg-[#121316] p-5">
              <p className="font-serif-display text-lg text-[#f8dde2]">파일 업로드</p>
              <p className="mt-1 text-xs text-white/65">선택한 스타일을 확인한 후, 이미지를 업로드해 작품 생성을 시작하세요.</p>
              <div
                className="mt-4 rounded-xl border border-[#800808]/40 bg-black/30 p-4"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/74">{fileName ? `업로드 완료: ${fileName}` : "작품으로 만들 사진을 이곳에 놓아주세요."}</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
                  >
                    <WandSparkles size={14} />
                    파일 선택
                  </button>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={triggerUpload}
              className="gold-border-glow inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#250f14]/85 px-5 py-4 text-sm font-semibold tracking-wide text-[#f5c2cb] transition hover:bg-[#311218]"
            >
              <Upload size={16} />
              업로드하고 아트 생성 시작하기
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
