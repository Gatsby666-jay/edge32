"use client";

import { motion } from "framer-motion";

type Variant = "solid" | "ghost";

/**
 * CTA 按钮：按压弹性 + hover 时背景上扫 / 箭头位移
 * 参考站的按钮反馈：细腻、克制、有物理感。
 */
export function CtaButton({
  href,
  children,
  variant = "solid",
  arrow = "up",
  cursorLabel,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: "up" | "link" | null;
  cursorLabel?: string;
}) {
  const solid = variant === "solid";

  return (
    <motion.a
      href={href}
      data-cursor-label={cursorLabel}
      whileHover={{ scale: 0.985 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`group relative inline-flex items-center gap-3 overflow-hidden border px-[30px] py-4 font-mono text-[13px] tracking-[0.12em] uppercase ${
        solid ? "border-red bg-red text-white" : "border-line text-ink"
      }`}
    >
      {!solid && (
        <span className="absolute inset-0 origin-bottom translate-y-full bg-red transition-transform duration-400 ease-out group-hover:translate-y-0" />
      )}
      <span className="relative z-[1] flex items-center gap-3">
        {children}
        {arrow === "up" && (
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-1">↑</span>
        )}
        {arrow === "link" && (
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">↗</span>
        )}
      </span>
    </motion.a>
  );
}
