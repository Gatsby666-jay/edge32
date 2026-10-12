import { MARQUEE_WORDS } from "@/lib/data";

/** 跑马灯：双轨无缝循环，hover 暂停（纯 CSS，服务端组件） */
export default function Marquee() {
  const track = (key: string) => (
    <div key={key} className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
      {MARQUEE_WORDS.map(([w, hl], i) => (
        <span
          key={i}
          className={`flex items-center gap-12 whitespace-nowrap font-mono text-[clamp(13px,1.4vw,17px)] tracking-[0.14em] uppercase ${hl ? "text-ink" : "text-muted"}`}
        >
          {w}
          <i className="not-italic text-red">◆</i>
        </span>
      ))}
    </div>
  );

  return (
    <div className="flex select-none overflow-hidden border-y border-linesoft py-[18px]" aria-hidden>
      {track("a")}
      {track("b")}
    </div>
  );
}
