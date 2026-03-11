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
        <p className="text-xs tracking-[0.29em] text-[#a7424f]/80 uppercase">시그니처 콘셉트</p>
        <h2 className="font-serif-display mt-3 text-3xl text-[#fbf6e5] sm:text-4xl">
          당신의 스타일을 선택하세요
        </h2>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -7 }}
          className="group relative overflow-hidden rounded-3xl border border-[#800808]/28 bg-[#1b1113]/70 p-7 sm:p-9"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(128,8,8,0.36),transparent_46%),linear-gradient(160deg,rgba(36,14,18,0.95)_10%,rgba(24,14,16,0.92)_50%,rgba(43,20,24,0.94)_100%)] transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
            <div className="h-full w-full bg-[radial-gradient(circle_at_65%_10%,rgba(182,70,84,0.22),transparent_33%)]" />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#800808]/48 bg-[#800808]/20 px-4 py-1 text-xs text-[#e3a9b0]">
              <Crown size={14} />
              The Royal Atelier
            </span>
            <h3 className="font-serif-display mt-5 text-2xl text-[#fae7ea] sm:text-[2rem]">고전 유화의 품격</h3>
            <p className="lux-copy mt-3 max-w-md text-sm text-[#f2ead2]/80">
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
          className="group relative overflow-hidden rounded-3xl border border-[#8f2b39]/30 bg-[#121018]/72 p-7 sm:p-9"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(148,35,54,0.33),transparent_36%),linear-gradient(150deg,rgba(25,16,31,0.92)_8%,rgba(28,15,25,0.92)_50%,rgba(32,14,20,0.95)_100%)] transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
            <div className="h-full w-full bg-[radial-gradient(circle_at_26%_78%,rgba(186,78,97,0.22),transparent_34%)]" />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#9d3544]/45 bg-[#9d3544]/16 px-4 py-1 text-xs text-[#f0c3ca]">
              <Clapperboard size={14} />
              Cine-Matic Paw
            </span>
            <h3 className="font-serif-display mt-5 text-2xl text-[#fcecef] sm:text-[2rem]">웅장한 시네마틱 무드</h3>
            <p className="lux-copy mt-3 max-w-md text-sm text-[#f2d4d8]/80">
              히어로 포스터의 강렬한 조명과 네온 무드를 결합해 반려동물을 영화 주인공으로 연출.
            </p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
