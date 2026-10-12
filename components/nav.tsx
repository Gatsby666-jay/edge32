"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChipLogo } from "@/components/loader";

const LINKS = [
  { href: "#problem", label: "痛点", en: "PROBLEM" },
  { href: "#roadmap", label: "学习路线", en: "ROADMAP" },
  { href: "#courses", label: "课程", en: "COURSES" },
  { href: "#resources", label: "资源", en: "RESOURCES" },
  { href: "#notes", label: "学习笔记", en: "NOTES" },
];

const SECTION_IDS = ["problem", "roadmap", "courses", "resources", "notes"];

/**
 * 导航：滚动进度条 + 当前区块高亮 + 移动端全屏菜单
 * 滚动监听用 ref 直接操作 DOM，避免每帧 setState 触发重渲染。
 */
export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      navRef.current?.classList.toggle("is-scrolled", y > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else if (!document.documentElement.dataset.loader) window.__lenis?.start();
  }, [open]);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed inset-x-0 top-0 z-[900] flex items-center justify-between border-b border-transparent px-gutter py-[18px] backdrop-blur-md transition-colors [&.is-scrolled]:border-linesoft [&.is-scrolled]:bg-bg/85"
      >
        <a href="#hero" className="flex items-center gap-2.5 font-mono text-[15px] font-bold tracking-[0.06em]" data-cursor-label="TOP">
          <ChipLogo className="h-[22px] w-[22px] text-ink" />
          EDGE<em className="not-italic text-red">32</em>
        </a>

        <div className="hidden gap-[clamp(14px,2.4vw,34px)] md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`group relative py-1 font-mono text-xs tracking-[0.1em] uppercase transition-colors ${active === l.href.slice(1) ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {l.label}
              <span className={`absolute inset-x-0 -bottom-px h-px origin-left bg-red transition-transform duration-350 ${active === l.href.slice(1) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} style={{ transformOrigin: "left" }} />
            </a>
          ))}
        </div>

        <button
          className="font-mono text-xs tracking-[0.14em] text-muted md:hidden"
          onClick={() => setOpen(true)}
          aria-label="打开菜单"
        >
          MENU
        </button>

        <div ref={barRef} className="absolute inset-x-0 bottom-[-1px] h-0.5 w-0 bg-red" />
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[950] flex flex-col bg-bg px-gutter pt-24 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute right-gutter top-6 font-mono text-xs tracking-[0.14em] text-muted"
              onClick={() => setOpen(false)}
              aria-label="关闭菜单"
            >
              CLOSE ✕
            </button>
            {LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                className="border-b border-linesoft py-5"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setOpen(false)}
              >
                <span className="block text-2xl font-black">{l.label}</span>
                <span className="mono-label mt-1 block">{l.en}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
