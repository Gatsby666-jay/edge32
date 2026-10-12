"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * 自定义光标：红点 + 弹性跟随圆环
 * - 悬停带 data-cursor-label 的元素时，圆环放大并显示文字标签
 *   （对应参考站按钮上的 data-label="cursor" 行为）
 * - 仅在精细指针设备启用
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 45, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 900, damping: 45, mass: 0.3 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("cc-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-cursor-label]") as HTMLElement | null;
      setLabel(el ? el.dataset.cursorLabel || "" : null);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.body.classList.remove("cc-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[3000] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red"
        style={{ x, y }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[3000] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50"
        style={{ x: sx, y: sy }}
        animate={{
          width: label ? 64 : 36,
          height: label ? 64 : 36,
          borderColor: label ? "#ee344a" : "rgba(255,255,255,0.5)",
          backgroundColor: label ? "rgba(238,52,74,0.16)" : "rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {label ? (
          <span className="font-mono text-[9px] tracking-[0.2em] text-ink">{label}</span>
        ) : null}
      </motion.div>
    </>
  );
}
