"use client";

import { motion } from "framer-motion";

const items = [
  { title: "8K Resolution", description: "초고해상도 디테일로 털결과 눈빛의 질감을 선명하게 보존합니다." },
  { title: "Studio Lighting", description: "고급 스튜디오 조명 톤을 고정 적용해 일관된 프리미엄 무드를 유지합니다." },
  { title: "Sharp Focus", description: "피사체 중심의 선명도를 강화해 작품의 몰입감과 존재감을 극대화합니다." },
];

export function LuxuryRevealStack() {
  return (
    <section className="mt-14">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
        }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {items.map((item) => (
          <motion.div
            key={item.title}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
            }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
          >
            <h4 className="font-serif-display text-xl text-[#f3dd98]">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-white/72">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
