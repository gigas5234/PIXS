"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Style definitions
   imageSrc: null = placeholder (swap when ready)
───────────────────────────────────────────── */
type StyleDef = {
  id: string;
  noteKey: string;
  num: string;
  title: string;
  subtitle: string;
  concept: "atelier" | "cinematic";
  imageSrc: string | null; // TODO: replace null with "/gallery/<name>_sample.png"
  placeholderGradient: string;
  pinLight: string;
  selectedBorder: string;
  selectedGlow: string;
  btnHover: string;
};

const ALL_STYLES: StyleDef[] = [
  /* ── Atelier ── */
  {
    id: "rembrandt",
    noteKey: "rembrandt",
    num: "01",
    title: "Rembrandt",
    subtitle: "빛과 그림자의 거장",
    concept: "atelier",
    imageSrc: "/gallery/pixs-masterpiece-rembrandt.png",
    placeholderGradient: "radial-gradient(ellipse at 35% 25%, #3d1a0c 0%, #1a0c07 50%, #0d0808 100%)",
    pinLight: "rgba(139,42,26,0.65)",
    selectedBorder: "1px solid rgba(128,8,8,0.9)",
    selectedGlow: "0 0 32px rgba(128,8,8,0.45)",
    btnHover: "hover:border-[#800808]/60 hover:bg-[#800808]/28 hover:text-[#f0cad0]",
  },
  {
    id: "vermeer",
    noteKey: "vermeer",
    num: "02",
    title: "Vermeer",
    subtitle: "고요한 자연광의 정수",
    concept: "atelier",
    imageSrc: "/gallery/pixs-masterpiece-vermeer.png",
    placeholderGradient: "radial-gradient(ellipse at 65% 30%, #1a2235 0%, #0e1522 50%, #0a0d16 100%)",
    pinLight: "rgba(107,138,178,0.6)",
    selectedBorder: "1px solid rgba(128,8,8,0.9)",
    selectedGlow: "0 0 32px rgba(128,8,8,0.4)",
    btnHover: "hover:border-[#800808]/60 hover:bg-[#800808]/28 hover:text-[#f0cad0]",
  },
  {
    id: "van-gogh",
    noteKey: "vangogh",
    num: "03",
    title: "Van Gogh",
    subtitle: "역동적 붓 터치의 긴장감",
    concept: "atelier",
    imageSrc: "/gallery/pixs-masterpiece-van-gogh.png",
    placeholderGradient: "radial-gradient(ellipse at 40% 55%, #2a1f08 0%, #1a1005 50%, #0d0d07 100%)",
    pinLight: "rgba(196,160,32,0.55)",
    selectedBorder: "1px solid rgba(128,8,8,0.9)",
    selectedGlow: "0 0 32px rgba(128,8,8,0.4)",
    btnHover: "hover:border-[#800808]/60 hover:bg-[#800808]/28 hover:text-[#f0cad0]",
  },
  {
    id: "picasso",
    noteKey: "picasso",
    num: "04",
    title: "Renaissance",
    subtitle: "왕실의 품격, 정밀한 구도",
    concept: "atelier",
    imageSrc: "/gallery/pixs-masterpiece-renaissance.png",
    placeholderGradient: "radial-gradient(ellipse at 55% 22%, #2d1c10 0%, #180e08 50%, #0f0b0a 100%)",
    pinLight: "rgba(184,134,11,0.5)",
    selectedBorder: "1px solid rgba(128,8,8,0.9)",
    selectedGlow: "0 0 32px rgba(128,8,8,0.4)",
    btnHover: "hover:border-[#800808]/60 hover:bg-[#800808]/28 hover:text-[#f0cad0]",
  },
  /* ── Cine-Matic ── */
  {
    id: "marvel-hero",
    noteKey: "heroic",
    num: "05",
    title: "Heroic",
    subtitle: "강렬한 히어로 조명의 중심",
    concept: "cinematic",
    imageSrc: "/gallery/pixs-masterpiece-marvel-hero.png",
    placeholderGradient: "radial-gradient(ellipse at 25% 50%, #0f1835 0%, #080e20 50%, #060709 100%)",
    pinLight: "rgba(75,125,212,0.65)",
    selectedBorder: "1px solid rgba(75,125,212,0.9)",
    selectedGlow: "0 0 32px rgba(75,125,212,0.42)",
    btnHover: "hover:border-[#4b7dd4]/60 hover:bg-[#4b7dd4]/22 hover:text-[#d8e4ff]",
  },
  {
    id: "disney-live-action",
    noteKey: "Fairytale",
    num: "06",
    title: "Fairytale",
    subtitle: "따뜻한 시네마틱 실사 감성",
    concept: "cinematic",
    imageSrc: "/gallery/pixs-masterpiece-disney-live-action.png",
    placeholderGradient: "radial-gradient(ellipse at 60% 30%, #201035 0%, #140a25 50%, #0a0810 100%)",
    pinLight: "rgba(180,100,220,0.55)",
    selectedBorder: "1px solid rgba(180,100,220,0.85)",
    selectedGlow: "0 0 28px rgba(180,100,220,0.38)",
    btnHover: "hover:border-[#b464dc]/55 hover:bg-[#b464dc]/20 hover:text-[#f0d8ff]",
  },
  {
    id: "cyberpunk",
    noteKey: "cyberpunk",
    num: "07",
    title: "Cyberpunk",
    subtitle: "네온 대비와 미래 도시 무드",
    concept: "cinematic",
    imageSrc: "/gallery/pixs-masterpiece-cyberpunk.png",
    placeholderGradient: "radial-gradient(ellipse at 20% 70%, #001828 0%, #000e1a 50%, #010508 100%)",
    pinLight: "rgba(0,200,255,0.55)",
    selectedBorder: "1px solid rgba(0,200,255,0.8)",
    selectedGlow: "0 0 28px rgba(0,200,255,0.32)",
    btnHover: "hover:border-[#00c8ff]/55 hover:bg-[#00c8ff]/15 hover:text-[#d0f8ff]",
  },
  {
    id: "western",
    noteKey: "western",
    num: "08",
    title: "Western Noir",
    subtitle: "드라마틱 역광의 대서사",
    concept: "cinematic",
    imageSrc: "/gallery/pixs-masterpiece-western.png",
    placeholderGradient: "radial-gradient(ellipse at 50% 40%, #1e1508 0%, #120c04 50%, #080604 100%)",
    pinLight: "rgba(200,154,60,0.5)",
    selectedBorder: "1px solid rgba(200,154,60,0.8)",
    selectedGlow: "0 0 28px rgba(200,154,60,0.3)",
    btnHover: "hover:border-[#c89a3c]/55 hover:bg-[#c89a3c]/18 hover:text-[#ffedb8]",
  },
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

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
type Props = {
  selectedStyleId: string | null;
  onSelectStyle: (id: string) => void;
  uploadSectionId: string;
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function ExhibitionGallery({ selectedStyleId, onSelectStyle, uploadSectionId }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sliderRef = useRef<HTMLDivElement>(null);

  const selectedStyle = ALL_STYLES.find((s) => s.id === selectedStyleId) ?? null;
  const anyHovered = hoveredId !== null;

  /* scroll to card in quick nav */
  const scrollToCard = useCallback((id: string) => {
    const style = ALL_STYLES.find((s) => s.id === id);
    if (!style) return;

    if (style.concept === "atelier") {
      const container = sliderRef.current;
      const card = cardRefs.current[id];
      if (container && card) {
        container.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const targetLeft = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
        setTimeout(() => {
          container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
        }, 300);
      }
    } else {
      const card = cardRefs.current[id];
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  /* select style + scroll to upload */
  const handleSelect = useCallback(
    (id: string) => {
      onSelectStyle(id);
      setTimeout(() => {
        const el = document.getElementById(uploadSectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    },
    [onSelectStyle, uploadSectionId],
  );

  const atelierStyles = ALL_STYLES.filter((s) => s.concept === "atelier");
  const cinematicStyles = ALL_STYLES.filter((s) => s.concept === "cinematic");

  return (
    <div className="relative w-full">
      {/* ── Quick Navigation (right side, desktop) ── */}
      <nav
        aria-label="스타일 빠른 이동"
        className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-[10px] lg:flex"
      >
        {ALL_STYLES.map((style) => {
          const isActive = selectedStyleId === style.id;
          return (
            <button
              key={style.id}
              type="button"
              title={style.title}
              onClick={() => scrollToCard(style.id)}
              className="group flex items-center gap-1.5 transition-opacity duration-300"
            >
              <motion.span
                animate={{ width: isActive ? 18 : 7, opacity: isActive ? 1 : 0.35 }}
                transition={{ duration: 0.3 }}
                className="block h-px bg-[#c05060]"
              />
              <span
                className={`font-mono text-[9px] transition-opacity duration-300 ${
                  isActive ? "text-[#f0cad0] opacity-100" : "text-white/35 group-hover:text-white/65 group-hover:opacity-100"
                }`}
              >
                {style.num}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ══════════════════════════════════════════
          Section A — The Classic Suite
          Horizontal scroll slider
      ══════════════════════════════════════════ */}
      <section className="mb-24">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="mb-1.5 text-[10px] tracking-[0.37em] text-[#d2a2aa] uppercase">The Classic Suite · I</p>
          <h2 className="font-serif-display text-3xl text-[#f7e0e5]">The Royal Atelier</h2>
          <p className="lux-copy mt-1 text-sm text-white/50">17세기 유럽 거장의 화풍으로 영원히 기록되다</p>
        </motion.header>

        {/* Horizontal slider */}
        <div
          ref={sliderRef}
          className="scrollbar-hide flex gap-5 overflow-x-auto pb-4"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {/* Leading spacer */}
          <div className="flex-none w-2 sm:w-4" />

          {atelierStyles.map((style, i) => {
            const isSelected = selectedStyleId === style.id;
            const isDimmed = anyHovered && hoveredId !== style.id;
            return (
              <div
                key={style.id}
                ref={(el) => {
                  cardRefs.current[style.id] = el;
                }}
                className={`relative flex-none cursor-pointer overflow-hidden rounded-2xl transition-[opacity,box-shadow,border-color] duration-500 ${
                  isDimmed ? "opacity-30" : "opacity-100"
                }`}
                style={{
                  width: "clamp(260px, 32vw, 340px)",
                  height: "clamp(380px, 48vw, 460px)",
                  scrollSnapAlign: "center",
                  background: style.imageSrc ? undefined : style.placeholderGradient,
                  border: isSelected ? style.selectedBorder : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: isSelected ? style.selectedGlow : "none",
                }}
                onMouseEnter={() => setHoveredId(style.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleSelect(style.id)}
              >
                {/* Image */}
                {style.imageSrc && (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('${style.imageSrc}')` }}
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Pin spotlight on hover */}
                <motion.div
                  animate={{ opacity: hoveredId === style.id ? 1 : 0 }}
                  transition={{ duration: 0.35 }}
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse 65% 38% at 50% 0%, ${style.pinLight} 0%, transparent 70%)`,
                  }}
                />

                {/* Placeholder label */}
                {!style.imageSrc && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="text-[10px] tracking-[0.27em] text-white/18 uppercase">Sample Coming Soon</p>
                  </div>
                )}

                {/* Selected badge */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="absolute right-3 top-3 rounded-full border border-[#800808]/55 bg-[#800808]/30 px-2.5 py-[3px] text-[10px] tracking-[0.18em] text-[#f0cad0]"
                    >
                      Selected
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Card info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-mono text-[9px] tracking-[0.33em] text-white/38 mb-1">{style.num}</p>
                  <p className="font-serif-display text-xl text-white leading-snug">{style.title}</p>
                  <p className="lux-copy mt-1 text-[11px] text-white/62">{style.subtitle}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(style.id);
                    }}
                    className={`mt-4 rounded-full border border-white/18 bg-black/42 px-4 py-1.5 text-[11px] text-white/75 backdrop-blur-sm transition-all duration-300 ${style.btnHover}`}
                  >
                    이 스타일 선택하기
                  </button>
                </div>
              </div>
            );
          })}

          {/* Trailing spacer */}
          <div className="flex-none w-2 sm:w-4" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          Section B — The Modern Gallery
          Masonry grid
      ══════════════════════════════════════════ */}
      <section className="mb-16">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="mb-1.5 text-[10px] tracking-[0.37em] text-[#a2aad2] uppercase">The Modern Gallery · II</p>
          <h2 className="font-serif-display text-3xl text-[#e4ebff]">Cine-Matic Paw</h2>
          <p className="lux-copy mt-1 text-sm text-white/50">할리우드의 웅장함, 미래의 감각으로 재탄생</p>
        </motion.header>

        {/*
          Masonry layout (12-col grid):
          ┌────────────────────┬──────────┐
          │  Heroic  (7 col)   │Fairytale │  ← row 1-4
          │                    │(5 col)   │
          │                    ├──────────┤
          │                    │Cyberpunk │  ← row 3-4
          └────────────────────┴──────────┘
          ┌────────────────────────────────┐
          │  Western Noir  (12 col)        │  ← row 5-7
          └────────────────────────────────┘
        */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "96px" }}
        >
          {cinematicStyles.map((style, i) => {
            const gridConfigs = [
              { col: "1 / span 7", row: "1 / span 4" }, // Heroic: tall left
              { col: "8 / span 5", row: "1 / span 2" }, // Fairytale: top right
              { col: "8 / span 5", row: "3 / span 2" }, // Cyberpunk: bottom right
              { col: "1 / span 12", row: "5 / span 3" }, // Western: full width
            ];
            const cfg = gridConfigs[i];
            const isSelected = selectedStyleId === style.id;
            const isDimmed = anyHovered && hoveredId !== style.id;

            return (
              <div
                key={style.id}
                ref={(el) => {
                  cardRefs.current[style.id] = el;
                }}
                className={`relative cursor-pointer overflow-hidden rounded-2xl transition-[opacity,box-shadow,border-color] duration-500 ${
                  isDimmed ? "opacity-30" : "opacity-100"
                }`}
                style={{
                  gridColumn: cfg.col,
                  gridRow: cfg.row,
                  background: style.placeholderGradient,
                  border: isSelected ? style.selectedBorder : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: isSelected ? style.selectedGlow : "none",
                }}
                onMouseEnter={() => setHoveredId(style.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleSelect(style.id)}
              >
                {/* Image */}
                {style.imageSrc && (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('${style.imageSrc}')` }}
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Pin spotlight */}
                <motion.div
                  animate={{ opacity: hoveredId === style.id ? 1 : 0 }}
                  transition={{ duration: 0.35 }}
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse 55% 35% at 50% 0%, ${style.pinLight} 0%, transparent 68%)`,
                  }}
                />

                {/* Placeholder */}
                {!style.imageSrc && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="text-[10px] tracking-[0.27em] text-white/16 uppercase">Sample Coming Soon</p>
                  </div>
                )}

                {/* Selected badge */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="absolute right-3 top-3 rounded-full border bg-black/50 px-2.5 py-[3px] text-[10px] tracking-[0.18em]"
                      style={{ borderColor: style.selectedBorder.replace("1px solid ", "") }}
                    >
                      Selected
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Card info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-mono text-[9px] tracking-[0.33em] text-white/35 mb-1">{style.num}</p>
                  <p className="font-serif-display text-xl text-white leading-snug">{style.title}</p>
                  <p className="lux-copy mt-1 text-[11px] text-white/60">{style.subtitle}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(style.id);
                    }}
                    className={`mt-3 rounded-full border border-white/18 bg-black/42 px-4 py-1.5 text-[11px] text-white/75 backdrop-blur-sm transition-all duration-300 ${style.btnHover}`}
                  >
                    이 스타일 선택하기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Stylist's Note (appears when a style is selected) ── */}
      <AnimatePresence>
        {selectedStyle && STYLE_NOTES[selectedStyle.noteKey] && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 rounded-2xl border border-white/10 bg-black/30 px-6 py-5 backdrop-blur-md"
          >
            <p className="text-[10px] tracking-[0.35em] text-[#d2a2aa] uppercase">The Stylist&apos;s Note — {selectedStyle.title}</p>
            <p className="font-serif-display mt-3 text-sm leading-relaxed text-[#f0dde1] sm:text-base">
              {STYLE_NOTES[selectedStyle.noteKey]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
