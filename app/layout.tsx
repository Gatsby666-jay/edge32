import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Noto_Serif_SC, JetBrains_Mono } from "next/font/google";
import SmoothScroll from "@/components/smooth-scroll";
import Cursor from "@/components/cursor";
import Grain from "@/components/grain";
import Loader from "@/components/loader";
import "./globals.css";

/*
 * 字体策略（next/font，构建期自托管，零第三方连接）：
 * - next/font 会拉取完整 CSS（含全部 CJK unicode-range 子集块），
 *   subsets 仅用于校验与预加载决策；CJK 字体因此不设 preload，
 *   由浏览器按 unicode-range 按需加载，避免近百个预请求拖慢 LCP。
 * - display: swap，避免 FOIT。
 */
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
  preload: false,
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/*
 * 站点绝对地址优先级：
 * NEXT_PUBLIC_SITE_URL > Vercel 自动注入 > GitHub Pages（Actions 自动注入 GITHUB_REPOSITORY）> 本地
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    return `https://${owner}.github.io/${repo}`;
  }
  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();
const ogImage = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EDGE32 — STM32 × 边缘人工智能学习站",
    template: "%s · EDGE32",
  },
  description:
    "一条从 STM32 到边缘 AI（TinyML）的免费学习路径：以 B站与 YouTube 免费课程为主线，含学习路线、课程列表、网盘资源与本地学习笔记。",
  keywords: [
    "STM32",
    "嵌入式",
    "TinyML",
    "边缘AI",
    "边缘人工智能",
    "FreeRTOS",
    "STM32Cube.AI",
    "单片机",
    "学习路线",
  ],
  authors: [{ name: "EDGE32" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "EDGE32 — STM32 × 边缘人工智能学习站",
    description:
      "从 C语言、寄存器、RTOS 一路走到 TinyML 与边缘 AI。免费课程主线 + 资源库 + 本地学习笔记。",
    siteName: "EDGE32",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "EDGE32 — STM32 × 边缘人工智能学习站",
    description: "从 STM32 出发，让单片机学会思考。",
    images: [ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${notoSansSC.variable} ${notoSerifSC.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          跳到主内容
        </a>
        <Loader />
        <SmoothScroll>
          <Cursor />
          <Grain />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
