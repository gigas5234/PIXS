"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, X } from "lucide-react";

export type LogEntry = {
  id: string;
  time: string;
  type: "request" | "success" | "error";
  message: string;
  detail?: unknown;
};

type Props = {
  logs: LogEntry[];
  onClear?: () => void;
};

/** 개발용 로그 패널. 배포 시 이 컴포넌트와 버튼만 제거하면 됨 */
export function DebugLogPanel({ logs, onClear }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[200] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/70 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/85 hover:text-white"
        title="로그 보기"
      >
        <Bug size={18} />
        {logs.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#800808] px-1 text-[10px] text-white">
            {logs.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-[201] flex max-h-[50vh] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-white/15 bg-black/95 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <span className="text-xs font-medium text-white/80">API 로그</span>
              <div className="flex gap-1">
                {onClear && logs.length > 0 && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="rounded px-2 py-1 text-[10px] text-white/50 hover:bg-white/10 hover:text-white/70"
                  >
                    지우기
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white/70"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-3 font-mono text-[11px]">
              {logs.length === 0 ? (
                <p className="text-white/35">아직 로그가 없습니다.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`mb-2 rounded border-l-2 px-2 py-1.5 ${
                      log.type === "error"
                        ? "border-[#e05050] bg-[#e05050]/10 text-[#f0a0a0]"
                        : log.type === "success"
                          ? "border-[#50c050] bg-[#50c050]/10 text-[#a0f0a0]"
                          : "border-white/30 bg-white/5 text-white/70"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">{log.time}</span>
                      <span>{log.message}</span>
                    </div>
                    {log.detail != null && (
                      <pre className="mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap break-all text-[10px] text-white/45">
                        {typeof log.detail === "object"
                          ? JSON.stringify(log.detail, null, 2)
                          : String(log.detail)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
