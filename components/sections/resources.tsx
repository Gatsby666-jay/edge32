import { Reveal } from "@/components/reveal";
import { LineReveal } from "@/components/reveal";
import { COMMUNITY, PAN_RESOURCES, TOOLS } from "@/lib/data";
import CopyButton from "@/components/sections/copy-button";

export default function Resources() {
  return (
    <section id="resources" className="sec px-gutter">
      <div className="sec-head">
        <Reveal as="p" className="eyebrow">
          (04) RESOURCES
        </Reveal>
        <LineReveal
          as="h2"
          className="h-section mt-[clamp(20px,3vw,36px)]"
          lines={[
            <>资源获取，</>,
            <>
              网盘与 <em className="accent">工具链</em>
            </>,
          ]}
        />
        <Reveal as="p" className="lead mt-[clamp(18px,2.4vw,30px)]" delay={0.2}>
          教程源码、数据手册、开发软件与 AI 工具链。百度网盘链接失效时，请以各<em>官方站点</em>为准。
        </Reveal>
      </div>

      <div className="mb-[clamp(48px,7vw,80px)] grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {PAN_RESOURCES.map((r, i) => (
          <Reveal
            as="article"
            key={r.url}
            delay={i * 0.08}
            className="flex flex-col gap-3 border border-linesoft bg-bg2 p-[clamp(22px,2.4vw,32px)] transition-[border-color,transform] duration-350 hover:-translate-y-1 hover:border-red"
          >
            <span className="self-start border border-red px-2.5 py-1 font-mono text-[10.5px] tracking-[0.14em] uppercase text-red">
              {r.tag}
            </span>
            <h4 className="text-[16.5px] font-bold leading-[1.4]">{r.title}</h4>
            <p className="flex-1 text-[13px] leading-[1.7] text-muted">{r.desc}</p>
            <span className="truncate whitespace-nowrap border border-linesoft bg-bg px-3 py-2.5 font-mono text-[11.5px] text-muted" title={r.url}>
              {r.url}
            </span>
            <div className="flex gap-2.5">
              <CopyButton text={r.pwd} />
              <a
                href={r.url}
                target="_blank"
                rel="noopener"
                data-cursor-label="OPEN"
                className="flex-1 border border-line px-4 py-2.5 text-center font-mono text-[11.5px] tracking-[0.08em] text-ink transition-colors hover:border-red hover:bg-red"
              >
                打开网盘 ↗
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-[clamp(30px,4vw,60px)] lg:grid-cols-2">
        <div>
          <Reveal as="h3" className="mb-2 text-[clamp(20px,2.2vw,26px)] font-black">
            开发<span className="accent">工具链</span>
          </Reveal>
          <Reveal as="p" className="mb-6 text-[13.5px] text-muted" delay={0.08}>
            从写第一行代码到跑通推理，你需要的全部软件。
          </Reveal>
          <ul className="list-none border-t border-linesoft">
            {TOOLS.map((t, i) => (
              <Reveal as="li" key={t.name} delay={i * 0.05} className="border-b border-linesoft">
                <a href={t.url} target="_blank" rel="noopener" data-cursor-label="OPEN" className="group flex items-center gap-4 px-1 py-4 transition-[padding,background-color] duration-300 hover:bg-bg2 hover:pl-3.5">
                  <span className="w-[34px] flex-none font-mono text-[11px] text-red">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-[14.5px] font-bold">{t.name}</b>
                    <span className="mt-[3px] block text-[12.5px] text-muted">{t.desc}</span>
                  </span>
                  <span className="font-mono text-faint transition-[color,transform] group-hover:translate-x-1 group-hover:text-red">↗</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>

        <div>
          <Reveal as="h3" className="mb-2 text-[clamp(20px,2.2vw,26px)] font-black">
            文档与<span className="accent">社区</span>
          </Reveal>
          <Reveal as="p" className="mb-6 text-[13.5px] text-muted" delay={0.08}>
            遇到问题先查手册，再上论坛——这是嵌入式工程师的基本功。
          </Reveal>
          <ul className="list-none border-t border-linesoft">
            {COMMUNITY.map((c, i) => (
              <Reveal as="li" key={c.name} delay={i * 0.05} className="border-b border-linesoft">
                <a href={c.url} target="_blank" rel="noopener" data-cursor-label="OPEN" className="group flex items-center gap-4 px-1 py-4 transition-[padding,background-color] duration-300 hover:bg-bg2 hover:pl-3.5">
                  <span className="w-[34px] flex-none font-mono text-[11px] text-red">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-[14.5px] font-bold">{c.name}</b>
                    <span className="mt-[3px] block text-[12.5px] text-muted">{c.desc}</span>
                  </span>
                  <span className="font-mono text-faint transition-[color,transform] group-hover:translate-x-1 group-hover:text-red">↗</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
