"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** 像素芯片 Logo（参考站同款像素风） */
export function ChipLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 55" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="37" height="4" transform="translate(6.5 0)" fill="currentColor" />
      <rect width="37" height="4" transform="translate(6.5 51)" fill="currentColor" />
      <path d="M5,7h27v3v10h-3v-10h-21v10h-3v-10-3Z" clipRule="evenodd" fillRule="evenodd" fill="currentColor" />
      <path d="M5,35h3v10h21v-10h3v10v3h-27v-3-10Z" clipRule="evenodd" fillRule="evenodd" fill="currentColor" />
      <rect width="3" height="3" transform="translate(8 20)" fill="currentColor" />
      <rect width="3" height="3" transform="translate(11 23)" fill="currentColor" />
      <rect width="3" height="3" transform="translate(14 26)" fill="currentColor" />
      <rect width="3" height="3" transform="translate(11 29)" fill="currentColor" />
      <rect width="3" height="3" transform="translate(8 32)" fill="currentColor" />
      <rect className="animate-blink" width="3" height="3" transform="translate(29 20) scale(-1,1)" fill="#ee344a" />
    </svg>
  );
}

/**
 * 加载器：0→100% 计数 + 进度条
 * - 进度真实等待 document.fonts.ready（上限 2.6s），而非纯计时表演
 * - 加载期间暂停 Lenis 滚动，完成后向上滑出
 * - prefers-reduced-motion 时直接跳过
 */
export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    // 同步标记：SmoothScroll 初始化时会读取并停止滚动
    // （Loader 的 effect 先于 SmoothScroll 执行，保证时序确定）
    document.documentElement.dataset.loader = "1";

    let raf = 0;
    let p = 0;
    const tick = () => {
      p = Math.min(92, p + Math.random() * 9 + 3);
      setProgress(Math.floor(p));
      if (p < 92) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      cancelAnimationFrame(raf);
      setProgress(100);
      delete document.documentElement.dataset.loader;
      window.__lenis?.start();
      setTimeout(() => setVisible(false), 650);
    };

    const fontsReady =
      typeof document.fonts?.ready === "object" ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2600))]).then(finish);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[4000] flex flex-col items-center justify-center gap-7 bg-bg"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE_IN_OUT }}
          aria-hidden
        >
          <ChipLogo className="h-[72px] w-[72px] text-ink" />
          <div className="font-mono text-sm tracking-[0.12em] text-muted">
            <span>{progress}</span>%
          </div>
          <div className="h-0.5 w-[min(280px,60vw)] overflow-hidden bg-linesoft">
            <div className="h-full bg-red transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
