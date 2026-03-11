"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Share2 } from "lucide-react";
import { getPromptByStyle } from "@/lib/prompts/style-prompts";

const stylePreviewMap: Record<string, string> = {
  rembrandt:
    "bg-[radial-gradient(circle_at_18%_12%,rgba(188,89,103,0.42),transparent_35%),linear-gradient(165deg,#3a141a_0%,#130f12_48%,#241218_100%)]",
  vermeer:
    "bg-[radial-gradient(circle_at_70%_16%,rgba(218,132,149,0.4),transparent_34%),linear-gradient(155deg,#2e1419_0%,#111217_50%,#231a1f_100%)]",
  "van-gogh":
    "bg-[radial-gradient(circle_at_24%_22%,rgba(156,56,71,0.45),transparent_36%),linear-gradient(150deg,#431621_0%,#1a1014_52%,#30131b_100%)]",
  picasso:
    "bg-[radial-gradient(circle_at_82%_24%,rgba(194,96,111,0.34),transparent_36%),linear-gradient(145deg,#321319_0%,#131115_52%,#28131a_100%)]",
  "marvel-hero":
    "bg-[radial-gradient(circle_at_70%_16%,rgba(178,52,70,0.46),transparent_35%),linear-gradient(152deg,#280f19_0%,#101118_54%,#21111a_100%)]",
  "disney-live-action":
    "bg-[radial-gradient(circle_at_22%_12%,rgba(205,118,131,0.36),transparent_34%),linear-gradient(152deg,#34121c_0%,#141117_50%,#24141c_100%)]",
  cyberpunk:
    "bg-[radial-gradient(circle_at_82%_15%,rgba(186,66,87,0.42),transparent_34%),linear-gradient(152deg,#270e17_0%,#100f16_50%,#1b1018_100%)]",
  western:
    "bg-[radial-gradient(circle_at_26%_20%,rgba(163,65,77,0.42),transparent_35%),linear-gradient(145deg,#2f1218_0%,#131014_51%,#241219_100%)]",
};

export function ResultView({ styleId }: { styleId: string }) {
  const router = useRouter();
  const [previewUrl] = useState<string | null>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pixs:uploadPreviewUrl") : null),
  );
  const [styleTitle] = useState<string>(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pixs:selectedStyleTitle") ?? "선택 스타일" : "선택 스타일"),
  );

  const styleClass = useMemo(
    () => stylePreviewMap[styleId] ?? "bg-[linear-gradient(165deg,#2b1118_0%,#101015_56%,#25121a_100%)]",
    [styleId],
  );

  return (
    <main className="min-h-screen px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-black/24 px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-center text-xs tracking-[0.2em] text-[#b45d69] uppercase">Result</p>
        <h1 className="font-serif-display mt-3 text-center text-3xl text-[#f8e9ec] sm:text-4xl">
          PIXS가 완성한 당신의 마스터피스입니다
        </h1>
        <p className="lux-copy mx-auto mt-4 max-w-2xl text-center text-sm text-white/74 sm:text-base">
          현재는 결과 레이아웃 검증용 더미 페이지입니다. 다음 단계에서 실제 생성 API 응답으로 교체됩니다.
        </p>

        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-[#800808]/35 bg-[#140f12] p-4 shadow-[0_30px_90px_rgba(8,4,7,0.7)]">
          <div className={`aspect-[4/5] w-full rounded-2xl border border-white/10 ${styleClass}`}>
            {previewUrl && (
              <div
                className="h-full w-full bg-cover bg-center mix-blend-screen opacity-40"
                style={{ backgroundImage: `url('${previewUrl}')` }}
              />
            )}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#800808]/60 bg-[#800808]/24 px-5 py-2.5 text-sm text-[#f0c6cd]"
          >
            <Download size={16} />
            다운로드
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/6 px-5 py-2.5 text-sm text-white/82"
          >
            <Share2 size={16} />
            공유하기
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm text-white/75"
          >
            다시 만들기
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          선택된 스타일: {styleTitle} / 프롬프트 연결: {getPromptByStyle(styleId) ? "완료" : "미연결"}
        </p>
      </section>
    </main>
  );
}
