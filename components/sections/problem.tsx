import { Reveal } from "@/components/reveal";
import { LineReveal } from "@/components/reveal";
import { PAINS } from "@/lib/data";

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" />
      <path d="M4 9h16M9 4v16" />
    </svg>
  ),
  split: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
    </svg>
  ),
  chip: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M7 9v6M12 9v6M17 9v6" />
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3" />
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  bookmark: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 3h14v18l-7-4-7 4V3z" />
    </svg>
  ),
};

export default function Problem() {
  return (
    <section id="problem" className="sec px-gutter">
      <div className="sec-head">
        <Reveal as="p" className="eyebrow">
          (01) THE PROBLEM
        </Reveal>
        <LineReveal
          as="h2"
          className="h-section mt-[clamp(20px,3vw,36px)]"
          lines={[
            <>大多数人，</>,
            <>
              卡在同一个<em className="accent">地方</em>
            </>,
          ]}
        />
        <Reveal as="p" className="lead mt-[clamp(18px,2.4vw,30px)]" delay={0.2}>
          不是缺乏资料——B站收藏夹里躺了几十门课。真正稀缺的，是<em>一条路径</em>，和一个记录成长的地方。
        </Reveal>
      </div>

      <div className="grid gap-px bg-linesoft [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {PAINS.map((p, i) => (
          <Reveal
            as="article"
            key={p.title}
            delay={i * 0.08}
            className="group relative overflow-hidden bg-bg p-[clamp(26px,3vw,40px)] transition-colors duration-350 hover:bg-bg2"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute right-3.5 top-2 font-mono text-[64px] font-bold leading-none text-white/[0.045] transition-colors duration-350 group-hover:text-redsoft"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="mb-[22px] grid h-10 w-10 place-items-center border border-line text-red">
              {ICONS[p.icon]}
            </span>
            <h3 className="mb-2.5 text-[17px] font-bold">{p.title}</h3>
            <p className="text-[13.5px] leading-[1.7] text-muted">{p.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
