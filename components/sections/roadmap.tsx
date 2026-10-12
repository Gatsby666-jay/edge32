"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { LineReveal } from "@/components/reveal";
import { ROAD_KEY, STAGES, courseById } from "@/lib/data";
import { loadJSON, saveJSON } from "@/lib/storage";

type RoadState = Record<string, number>;

export default function Roadmap() {
  const [state, setState] = useState<RoadState>({});

  useEffect(() => {
    setState(loadJSON<RoadState>(ROAD_KEY, {}));
  }, []);

  const total = STAGES.reduce((n, s) => n + s.points.length, 0);
  const done = Object.keys(state).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggle = (key: string) => {
    setState((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = Date.now();
      saveJSON(ROAD_KEY, next);
      return next;
    });
  };

  const reset = () => {
    if (!window.confirm("确定要清空所有阶段的学习进度吗？此操作不可恢复。")) return;
    const next: RoadState = {};
    setState(next);
    saveJSON(ROAD_KEY, next);
  };

  return (
    <section id="roadmap" className="sec px-gutter">
      <div className="sec-head">
        <Reveal as="p" className="eyebrow">
          (02) THE ROADMAP
        </Reveal>
        <LineReveal
          as="h2"
          className="h-section mt-[clamp(20px,3vw,36px)]"
          lines={[
            <>六个阶段，</>,
            <>
              从点灯到 <em className="accent">边缘推理</em>
            </>,
          ]}
        />
        <Reveal as="p" className="lead mt-[clamp(18px,2.4vw,30px)]" delay={0.2}>
          每阶段包含学习目标、核心重点与推荐课程。点击要点左侧的方框即可<em>勾选进度</em>——数据只保存在你的浏览器本地。
        </Reveal>
      </div>

      <Reveal className="mb-[clamp(36px,5vw,56px)] flex items-center gap-5 border border-linesoft bg-bg2 px-[22px] py-[18px]">
        <span className="mono-label whitespace-nowrap">ROADMAP PROGRESS</span>
        <div className="relative h-1.5 flex-1 bg-linesoft">
          <motion.div
            className="absolute inset-y-0 left-0 bg-red"
            animate={{ width: `${pct}%` }}
            initial={false}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="min-w-[52px] text-right font-mono font-bold text-red">{pct}%</span>
        <button
          className="whitespace-nowrap border border-linesoft px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-faint transition-colors hover:border-red hover:text-red"
          onClick={reset}
        >
          重置进度
        </button>
      </Reveal>

      <div>
        {STAGES.map((s) => (
          <article key={s.id} id={s.id} className="group grid gap-[clamp(24px,4vw,64px)] border-t border-linesoft py-[clamp(36px,5vw,64px)] last:border-b lg:grid-cols-[minmax(150px,220px)_1fr]">
            <div>
              <div className="stage-num font-mono text-[clamp(56px,7vw,96px)] font-bold leading-none">{s.num}</div>
              <span className="mt-[18px] inline-block border border-linesoft px-3 py-1.5 font-mono text-[12px] tracking-[0.1em] text-muted">
                {s.duration}
              </span>
            </div>
            <div>
              <h3 className="flex flex-wrap items-baseline gap-3.5 text-[clamp(24px,3vw,38px)] font-black leading-[1.1]">
                {s.name}
                <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-red">{s.en}</span>
              </h3>
              <p className="mt-3.5 max-w-[60ch] text-[15px] text-muted">
                <b className="font-bold text-ink">阶段目标 ·</b> {s.goal}
              </p>

              <ul className="mt-6 list-none">
                {s.points.map((p, i) => {
                  const key = `${s.id}:${i}`;
                  const checked = !!state[key];
                  return (
                    <li
                      key={key}
                      className={`flex items-start gap-3.5 border-b border-dashed border-linesoft py-[11px] text-[14.5px] transition-colors ${checked ? "text-faint line-through decoration-red" : "text-[#d6d5d0]"}`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        aria-pressed={checked}
                        aria-label={checked ? "取消勾选" : "勾选要点"}
                        data-cursor-label={checked ? "UNDO" : "DONE"}
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-colors ${checked ? "border-red bg-red" : "border-line hover:border-red"}`}
                      >
                        <motion.svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.4 }}
                          transition={{ type: "spring", stiffness: 500, damping: 28 }}
                        >
                          <path d="M4 12l6 6L20 4" fill="none" stroke="#fff" strokeWidth="3.4" />
                        </motion.svg>
                      </button>
                      <span>{p}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <span className="mono-label mr-1">课程 →</span>
                {s.courses.map((cid) => {
                  const c = courseById(cid);
                  if (!c) return null;
                  return (
                    <a
                      key={cid}
                      href={c.url}
                      target="_blank"
                      rel="noopener"
                      title={`${c.title} · ${c.author}`}
                      data-cursor-label="VIEW"
                      className="inline-flex items-center gap-2 border border-linesoft px-[13px] py-[7px] font-mono text-xs text-muted transition-colors hover:border-red hover:bg-redsoft hover:text-ink before:text-red before:content-['→']"
                    >
                      {c.title}
                    </a>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
