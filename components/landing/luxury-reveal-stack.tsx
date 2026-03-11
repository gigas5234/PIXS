"use client";

import { motion } from "framer-motion";

const items = [
  { title: "8K 초고해상도", description: "털결과 눈빛의 디테일을 선명하게 보존해 작품의 완성도를 높입니다." },
  { title: "스튜디오 조명 연출", description: "전문 스튜디오 라이팅 톤을 적용해 고급스러운 분위기를 유지합니다." },
  { title: "선명한 피사체 포커스", description: "피사체 중심의 초점을 강화해 몰입감 있는 결과물을 완성합니다." },
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
            <h4 className="font-serif-display text-xl text-[#d58a95]">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-white/72">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
