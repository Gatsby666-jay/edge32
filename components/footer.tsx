import { ChipLogo } from "@/components/loader";

const NAV = [
  { href: "#problem", label: "学习痛点" },
  { href: "#roadmap", label: "学习路线" },
  { href: "#courses", label: "课程列表" },
  { href: "#resources", label: "资源获取" },
  { href: "#notes", label: "学习笔记" },
];

const LINKS = [
  { name: "ST 官网", url: "https://www.st.com/zh/microcontrollers-microprocessors.html" },
  { name: "正点原子论坛", url: "http://www.openedv.com/" },
  { name: "野火论坛", url: "https://www.firebbs.cn/forum-stm32-1.html" },
  { name: "STM32 中文社区", url: "https://www.stmcu.org.cn/" },
  { name: "Edge Impulse 文档", url: "https://docs.edgeimpulse.com/" },
];

export default function Footer() {
  return (
    <footer className="border-t border-linesoft px-gutter py-[clamp(40px,6vw,72px)]">
      <div className="mb-11 flex flex-wrap justify-between gap-7">
        <div className="max-w-[420px]">
          <a href="#hero" className="flex items-center gap-2.5 font-mono text-[15px] font-bold tracking-[0.06em]">
            <ChipLogo className="h-[22px] w-[22px] text-ink" />
            EDGE<em className="not-italic text-red">32</em>
          </a>
          <p className="mt-3.5 text-[13px] leading-[1.8] text-muted">
            STM32 × 边缘人工智能个人学习站。内容整理自 B站、YouTube 与各官方站点的公开免费资源，
            版权归原作者所有；课程与网盘链接如有失效，请以官方渠道为准。
          </p>
        </div>
        <div className="flex flex-wrap gap-14">
          <div>
            <h5 className="mono-label mb-4">站点导航</h5>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="block py-[5px] text-[13.5px] text-muted transition-colors hover:text-red">
                {n.label}
              </a>
            ))}
          </div>
          <div>
            <h5 className="mono-label mb-4">常用入口</h5>
            {LINKS.map((l) => (
              <a key={l.name} href={l.url} target="_blank" rel="noopener" className="block py-[5px] text-[13.5px] text-muted transition-colors hover:text-red">
                {l.name}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-3.5 border-t border-linesoft pt-6 font-mono text-[11px] tracking-[0.08em] text-faint">
        <span>EDGE32 · 个人学习项目 · NEXT.JS BUILD</span>
        <span>
          DESIGNED AFTER <b className="font-medium text-red">GRILLEDPIXELS.COM</b> STYLE
        </span>
        <span>NOTES STORED IN LOCALSTORAGE</span>
      </div>
    </footer>
  );
}
