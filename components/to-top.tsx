"use client";

import { useEffect, useRef } from "react";

/** 回到顶部按钮（ref 直接操作类名，零重渲染） */
export default function ToTop() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      ref.current?.classList.toggle("is-show", window.scrollY > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      ref={ref}
      aria-label="回到顶部"
      className="fixed bottom-[26px] right-[26px] z-[800] grid h-[46px] w-[46px] translate-y-3 place-items-center border border-line bg-bg/80 font-mono text-base text-muted opacity-0 backdrop-blur-md transition-all duration-300 hover:border-red hover:bg-red hover:text-white [&.is-show]:translate-y-0 [&.is-show]:opacity-100"
      onClick={() => {
        if (window.__lenis) window.__lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      ↑
    </button>
  );
}
