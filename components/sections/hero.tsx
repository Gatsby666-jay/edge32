"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { CtaButton } from "@/components/cta-button";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};
const lineUp = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 0.95, ease: EASE } },
};

/** 数字滚动计数（入场微交互） */
function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    const dur = 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return (
    <div>
      <b className="block font-mono text-[clamp(26px,3.4vw,44px)] font-bold leading-none">
        {String(n).padStart(2, "0")}
        <i className="not-italic text-red">{suffix}</i>
      </b>
      <span className="mono-label mt-2 block">{label}</span>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const gx = useSpring(0, { stiffness: 40, damping: 20 });
  const gy = useSpring(0, { stiffness: 40, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    gx.set(((e.clientX - r.left) / r.width - 0.5) * 60);
    gy.set(((e.clientY - r.top) / r.height - 0.5) * 60);
  };

  return (
    <section
      id="hero"
      ref={ref}
      onMouseMove={reduce ? undefined : onMove}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-gutter pt-[120px] pb-10"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-[18%] -top-[12%] h-[46vw] max-h-[720px] min-h-[420px] w-[46vw] min-w-[420px] rounded-full"
        style={{
          x: gx,
          y: gy,
          background: "radial-gradient(circle, rgba(238,52,74,0.16), transparent 62%)",
        }}
      />

      <motion.div
        className="relative z-[2]"
        initial="hidden"
        animate={reduce ? undefined : "show"}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } } }}
      >
        <motion.p className="eyebrow" variants={rise}>
          EMBEDDED × EDGE AI // 学习路径 · 2026
        </motion.p>

        <h1 className="h-display mb-[clamp(24px,4vh,40px)]">
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span className="block" variants={lineUp}>
              从 STM32 出发，
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span className="block" variants={lineUp}>
              让单片机 <em className="accent">学会思考</em>
            </motion.span>
          </span>
        </h1>

        <motion.p className="lead mb-[clamp(28px,4vh,44px)]" variants={rise}>
          一条为嵌入式初学者铺平的道路：以 <em>B站与 YouTube 免费课程</em>为主线，从 C语言、寄存器、RTOS
          一路走到 <em>TinyML 与边缘 AI</em>。附完整资源库与本地学习笔记，一切进度只保存在你的浏览器里。
        </motion.p>

        <motion.div className="mb-[clamp(36px,6vh,60px)] flex flex-wrap gap-4" variants={rise}>
          <CtaButton href="#roadmap" variant="solid" cursorLabel="GO">
            查看学习路线
          </CtaButton>
          <CtaButton href="#resources" variant="ghost" arrow="link" cursorLabel="OPEN">
            资源获取
          </CtaButton>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-[clamp(24px,5vw,72px)] border-t border-linesoft pt-7"
          variants={rise}
        >
          <Stat value={6} suffix="" label="学习阶段" />
          <Stat value={20} suffix="+" label="免费课程" />
          <Stat value={100} suffix="%" label="免费资源" />
          <Stat value={0} suffix="¥" label="课程花费" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-[26px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-faint">
        SCROLL
        <span className="h-11 w-px animate-drip bg-gradient-to-b from-red to-transparent" />
      </div>
    </section>
  );
}
