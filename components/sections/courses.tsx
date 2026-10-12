"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { LineReveal } from "@/components/reveal";
import { COURSES, PLATFORMS, PLAT_NAME, type Platform } from "@/lib/data";

type Filter = "all" | Platform;

const PLAT_CLASS: Record<Platform, string> = {
  bilibili: "text-[#4fc3f7]",
  youtube: "text-[#ff5252]",
  mooc: "text-red",
};

export default function Courses() {
  const [filter, setFilter] = useState<Filter>("all");
  const list = filter === "all" ? COURSES : COURSES.filter((c) => c.platform === filter);

  return (
    <section id="courses" className="sec px-gutter">
      <div className="sec-head">
        <Reveal as="p" className="eyebrow">
          (03) COURSES
        </Reveal>
        <LineReveal
          as="h2"
          className="h-section mt-[clamp(20px,3vw,36px)]"
          lines={[
            <>免费课程，</>,
            <>
              全部 <em className="accent">免费公开</em>
            </>,
          ]}
        />
        <Reveal as="p" className="lead mt-[clamp(18px,2.4vw,30px)]" delay={0.2}>
          以 <em>B站</em>中文课程为主线，<em>YouTube</em> 与官方 MOOC 为进阶补充。按平台筛选，找到适合你当前阶段的那一门。
        </Reveal>
      </div>

      <Reveal className="mb-[clamp(30px,4vw,48px)] flex flex-wrap gap-2.5" delay={0.1}>
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            className={`border px-5 py-[11px] font-mono text-xs tracking-[0.12em] uppercase transition-all duration-280 ${
              filter === p.key ? "border-ink bg-ink text-bg" : "border-linesoft text-muted hover:border-line hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </Reveal>

      <div className="grid gap-px bg-linesoft [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {list.map((c, i) => (
          <article
            key={`${filter}-${c.id}`}
            className="group relative flex animate-fadeup flex-col gap-3.5 overflow-hidden bg-bg p-[clamp(24px,2.6vw,36px)] transition-colors duration-350 hover:bg-bg2"
            style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
          >
            <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-red transition-transform duration-400 ease-out group-hover:scale-x-100" />
            <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.1em] uppercase">
              <span className={PLAT_CLASS[c.platform]}>▸ {PLAT_NAME[c.platform]}</span>
              <span className="text-faint">{c.meta}</span>
            </div>
            <h4 className="text-[18px] font-bold leading-[1.35]">{c.title}</h4>
            <p className="text-[13px] text-muted">
              UP主 / 讲师 · <b className="font-bold text-ink">{c.author}</b>
            </p>
            <p className="flex-1 text-[13.5px] leading-[1.7] text-muted">{c.desc}</p>
            <div className="flex flex-wrap gap-2">
              {c.tags.map((t) => (
                <span key={t} className="border border-linesoft px-2.5 py-1 font-mono text-[10.5px] tracking-[0.08em] text-muted">
                  {t}
                </span>
              ))}
            </div>
            <a
              href={c.url}
              target="_blank"
              rel="noopener"
              data-cursor-label="VIEW"
              className="mt-1.5 inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.12em] uppercase text-ink transition-all duration-250 hover:gap-3.5 hover:text-red"
            >
              <i className="not-italic text-red">→</i> 前往观看
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
