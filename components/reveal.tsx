"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TAGS = ["div", "section", "p", "span", "li", "article", "h2", "h3", "h4", "ul", "figure"] as const;
type Tag = (typeof TAGS)[number];

/**
 * 滚动入场动画原语（替代静态版的 .rv + IntersectionObserver）
 * 进入视口一次后保持终态；prefers-reduced-motion 时无动画。
 */
export function Reveal({
  as = "div",
  delay = 0,
  y = 26,
  className,
  children,
}: {
  as?: Tag;
  delay?: number;
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const M = motion[as] as React.ElementType;

  const anim = reduce
    ? {}
    : {
        initial: { opacity: 0, y },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -8% 0px" },
        transition: { duration: 0.8, delay, ease: EASE },
      };

  return (
    <M className={className} {...anim}>
      {children}
    </M>
  );
}

/**
 * 大标题逐行上移动画（参考站的 roll-line 效果）
 * 每行外套 overflow-hidden 容器，内层从 translateY(110%) 归位。
 */
export function LineReveal({
  as = "h2",
  lines,
  className,
  baseDelay = 0,
}: {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  lines: ReactNode[];
  className?: string;
  baseDelay?: number;
}) {
  const reduce = useReducedMotion();
  const Outer = as as React.ElementType;

  const lineAnim = (i: number) =>
    reduce
      ? {}
      : {
          initial: { y: "110%" },
          whileInView: { y: 0 },
          viewport: { once: true, margin: "0px 0px -10% 0px" },
          transition: { duration: 0.9, delay: baseDelay + i * 0.12, ease: EASE },
        };

  return (
    <Outer className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.07em]">
          <motion.span className="block" {...lineAnim(i)}>
            {line}
          </motion.span>
        </span>
      ))}
    </Outer>
  );
}
