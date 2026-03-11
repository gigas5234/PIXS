"use client";

import { motion } from "framer-motion";
import { Clapperboard, Crown } from "lucide-react";

export function DualThemeSelector() {
  return (
    <section className="mt-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65 }}
        className="mb-7 text-center"
      >
        <p className="text-xs tracking-[0.24em] text-[#e1c16e]/80 uppercase">Signature Concepts</p>
        <h2 className="font-serif-display mt-3 text-3xl text-[#fbf6e5] sm:text-4xl">
          Pick Your Signature Studio Mood
        </h2>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -7 }}
          className="group relative overflow-hidden rounded-3xl border border-[#e1c16e]/22 bg-[#19140f]/70 p-7 sm:p-9"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,175,55,0.3),transparent_46%),linear-gradient(160deg,rgba(44,29,14,0.95)_10%,rgba(20,16,14,0.9)_50%,rgba(39,28,18,0.92)_100%)] transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
            <div className="h-full w-full bg-[radial-gradient(circle_at_65%_10%,rgba(251,230,151,0.2),transparent_33%)]" />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e1c16e]/40 bg-[#e1c16e]/10 px-4 py-1 text-xs text-[#f3dd98]">
              <Crown size={14} />
              The Royal Atelier
            </span>
            <h3 className="font-serif-display mt-5 text-2xl text-[#f8edcc] sm:text-[2rem]">Classic Oil Prestige</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#f2ead2]/80">
              렘브란트의 명암, 베르메르의 부드러운 빛, 고흐의 질감을 결합한 궁정 화가 스타일.
            </p>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ delay: 0.31, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -7 }}
          className="group relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#0f131b]/72 p-7 sm:p-9"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(66,193,255,0.28),transparent_36%),linear-gradient(150deg,rgba(16,24,44,0.9)_8%,rgba(21,14,31,0.9)_50%,rgba(8,19,34,0.95)_100%)] transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
            <div className="h-full w-full bg-[radial-gradient(circle_at_26%_78%,rgba(201,90,255,0.2),transparent_34%)]" />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/35 bg-cyan-200/10 px-4 py-1 text-xs text-cyan-100">
              <Clapperboard size={14} />
              Cine-Matic Paw
            </span>
            <h3 className="font-serif-display mt-5 text-2xl text-[#f4f8ff] sm:text-[2rem]">Grand Cinematic Aura</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cyan-100/80">
              히어로 포스터의 강렬한 조명과 네온 무드를 결합해 반려동물을 영화 주인공으로 연출.
            </p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
