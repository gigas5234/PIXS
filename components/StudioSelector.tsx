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

const subStyleCatalog: Record<StyleCategory, SubStyle[]> = {
  atelier: [
    { id: "rembrandt", title: "Rembrandt", description: "깊은 명암 대비와 왕실 초상화의 무게감." },
    { id: "vermeer", title: "Vermeer", description: "부드러운 자연광과 고요한 미술관의 분위기." },
    { id: "van-gogh", title: "Van Gogh", description: "생동감 있는 붓터치와 감성적인 임파스토." },
    { id: "picasso", title: "Picasso", description: "현대적 구도와 예술적 해석이 강조된 초상." },
  ],
  cinematic: [
    { id: "marvel-hero", title: "Marvel Hero", description: "히어로 포스터 스타일의 강렬한 조명과 실루엣." },
    { id: "disney-live-action", title: "Disney Live-action", description: "따뜻하고 영화적인 실사 텍스처 중심 연출." },
    { id: "cyberpunk", title: "Cyberpunk", description: "네온 하이라이트와 미래 도시의 고대비 무드." },
    { id: "western", title: "Western", description: "영화적인 먼지빛 톤과 드라마틱한 역광." },
  ],
};

export function StudioSelector() {
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory>("atelier");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleStyles = useMemo(() => subStyleCatalog[selectedCategory], [selectedCategory]);

  const selectedStyle = useMemo(
    () => visibleStyles.find((style) => style.id === selectedStyleId) ?? null,
    [visibleStyles, selectedStyleId],
  );

  const triggerUpload = () => {
    setIsDropzoneOpen(true);
    fileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsDropzoneOpen(true);
    }
  };

  const onPickCategory = (category: StyleCategory) => {
    setSelectedCategory(category);
    setSelectedStyleId(null);
    setFileName("");
    setIsDropzoneOpen(false);
  };

  return (
    <section className="mt-14 rounded-[1.8rem] border border-white/10 bg-white/[0.02] px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-7 text-center">
        <p className="text-xs tracking-[0.2em] text-[#e1c16e]/85 uppercase">Studio Selector</p>
        <h2 className="font-serif-display mt-3 text-3xl text-[#f9f1d8] sm:text-4xl">Pick Your Master&apos;s Mood</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
          선택한 메인 컨셉에 맞춰 세부 작가/장르 스타일을 고르고, 이후 AI 프롬프트 주입이 가능한 구조로 확장됩니다.
        </p>
      </div>

      <div className="mx-auto mb-7 grid max-w-2xl grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/30 p-2">
        <button
          type="button"
          onClick={() => onPickCategory("atelier")}
          className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
            selectedCategory === "atelier"
              ? "bg-[#e1c16e]/18 text-[#f4dfaa]"
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
              ? "bg-[#e1c16e]/18 text-[#f4dfaa]"
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
                        "0 0 0 rgba(225, 193, 110, 0.0)",
                        "0 0 22px rgba(225, 193, 110, 0.3)",
                        "0 0 14px rgba(225, 193, 110, 0.2)",
                      ],
                    }
                  : { boxShadow: "0 0 0 rgba(225, 193, 110, 0)" }
              }
              transition={{ duration: 1.6, repeat: isSelected ? Infinity : 0, ease: "easeInOut" }}
              className={`group relative overflow-hidden rounded-2xl border bg-black/40 p-4 text-left backdrop-blur-xl transition ${
                isSelected ? "border-[#e1c16e]/80" : "border-white/10 hover:border-[#e1c16e]/35"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(225,193,110,0.14),transparent_40%)] opacity-0 transition group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif-display text-lg text-[#f8efcf]">{style.title}</h3>
                  <AnimatePresence>
                    {isSelected ? (
                      <motion.span
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="inline-flex items-center gap-1 rounded-full border border-[#e1c16e]/45 bg-[#e1c16e]/18 px-2 py-1 text-[10px] tracking-wide text-[#f6e3ab]"
                      >
                        <Check size={12} />
                        The Master&apos;s Pick
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-white/70">{style.description}</p>
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
            className="mt-8"
          >
            <button
              type="button"
              onClick={triggerUpload}
              className="gold-border-glow inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#221a0f]/85 px-5 py-4 text-sm font-semibold tracking-wide text-[#f6e2a6] transition hover:bg-[#2a2112]"
            >
              <Upload size={16} />
              Upload &amp; Start Artification
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
              aria-label="Upload pet image"
            />

            <AnimatePresence>
              {isDropzoneOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-4 overflow-hidden rounded-2xl border border-dashed border-[#e1c16e]/45 bg-black/35 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-serif-display text-lg text-[#f8efcf]">{selectedStyle.title} Style Selected</p>
                      <p className="mt-1 text-sm text-white/70">
                        {fileName ? `Uploaded: ${fileName}` : "이미지를 드롭하거나 클릭하여 업로드를 완료하세요."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
                    >
                      <WandSparkles size={14} />
                      Choose File
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
