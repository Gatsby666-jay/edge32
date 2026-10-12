# EDGE32 优化方案 — 参考 grilledpixels.com 的全方位升级

本文档记录从纯静态版升级到 Next.js 15 的完整优化思路、代码模式与踩坑经验。网站核心内容（六大区块）未做任何改动。

---

## 一、参考站设计哲学解析

对 `grilledpixels.com/ecommerce` 的源码与 CSS 分析后，提炼出以下设计基因：

| 维度 | 参考站做法 | 本站落地 |
| --- | --- | --- |
| 色彩 | 纯黑 `#0a0a0a` 底、白字、唯一点缀色红 `#EE344A`（从 CSS 精确提取） | Tailwind `@theme` 令牌 `--color-red: #ee344a`，全局仅此一个强调色 |
| 字体 | 付费 Untitled Sans（粗体大标题）+ Tronica/AtHauss Mono（等宽标签）+ 斜体衬线强调词 | 免费替代：Noto Sans SC 900（标题）/ JetBrains Mono（标签）/ Noto Serif SC 斜体红（强调词） |
| 排印 | clamp() 流式字号、超大标题（~118px）、字重 900 与斜体的混排 | `.h-display` / `.h-section` / `.accent` 组件类 + `text-wrap: balance` |
| 留白 | 区块间距 clamp(80px→160px)，内容最大宽度克制 | `.sec` 统一节奏 + `--spacing-gutter` 流式页边距 |
| 动效 | 逐行上移（roll-line）、逐词入场、0→100% 加载计数、Lenis 平滑滚动、跑马灯 | LineReveal / Reveal / Loader / SmoothScroll / Marquee |
| 细节 | 噪点纹理、像素风 Logo、按钮 data-label 跟随光标、红点鼠标 | Grain / ChipLogo / Cursor 标签系统 |

**核心洞察**：参考站的"高级感"不来自复杂特效，而来自**克制的三色系统 + 极端的字重对比 + 精确的动效时序**。本站完全复刻这一思路。

---

## 二、UI/UX 改进清单

| # | 优化项 | 静态版问题 | 现在 |
| --- | --- | --- | --- |
| 1 | 字体自托管 | Google Fonts CDN 运行时加载，国内不稳定，LCP 受第三方连接影响 | `next/font` 构建期下载自托管，零第三方请求，自动 `size-adjust` 防抖 |
| 2 | 加载器诚实化 | 纯计时表演，字体未就绪就揭幕 | 等 `document.fonts.ready`（上限 2.6s），加载期 Lenis 锁定滚动 |
| 3 | 光标标签系统 | 仅有圆环放大 | 悬停课程/网盘/按钮时圆环显示 `VIEW` / `OPEN` / `GO` 文字标签（对应参考站 data-label 行为） |
| 4 | 导航活动态 | 无当前区块指示 | IntersectionObserver 高亮当前区块 + 顶部红色滚动进度条 |
| 5 | 移动端导航 | 直接隐藏链接 | MENU 全屏菜单，逐项错峰入场 |
| 6 | Hero 编排 | 一次性淡入 |  eyebrow→标题逐行→文案→按钮→数据 五级 stagger；数字计数滚动；红色光斑鼠标视差 |
| 7 | 按钮反馈 | 颜色突变 | 按压弹簧（whileTap 0.96）+ 背景上扫 + 箭头位移 |
| 8 | 笔记卡片 | 静态渲染 | Framer Motion `layout` + `AnimatePresence` 增删动画 |
| 9 | 可访问性 | 无 | 跳转主内容链接、`focus-visible` 红框、`prefers-reduced-motion` 全量降级、aria 标签 |
| 10 | 社交/SEO | 仅 title | 完整 OpenGraph / Twitter Card + 1200×630 分享图 + keywords + robots |

---

## 三、代码与组件优化

### 3.1 架构：Server / Client 精确划分

```
layout.tsx (Server)          字体、metadata、Provider 组装
  └─ page.tsx (Server)       区块组装，不发一行客户端 JS
       ├─ Marquee / Footer / Problem / Resources / Cta   ← 服务端组件
       └─ Hero / Roadmap / Courses / Notes / Nav / Cursor ← 客户端组件（按需）
```

只有需要交互的组件带 `"use client"`；动效原语（Reveal/LineReveal）是客户端组件，但可以被服务端区块直接引用——children 保持服务端渲染。笔记编辑器用 `next/dynamic({ ssr: false })` 懒加载，不进首屏包。

### 3.2 Lenis 平滑滚动（components/smooth-scroll.tsx）

```tsx
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
window.__lenis = lenis;   // 供 Loader / Nav / ToTop 协同步

let raf = 0;
const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
raf = requestAnimationFrame(loop);

// 锚点点击统一走 lenis.scrollTo，带导航偏移
document.addEventListener("click", onClick);   // 事件委托，零重复绑定
```

要点：
- `prefers-reduced-motion` 时**完全不初始化**，回退原生滚动；
- globals.css 必须带 Lenis 官方要求的三条规则（`html.lenis { height: auto }` 等），否则滚动会失效；
- ⚠️ **踩坑记录**：Loader 想"加载期锁定滚动"，最初用 `setTimeout(() => lenis.stop())`，结果宏任务晚于 `fonts.ready` 的微任务（`lenis.start()`）执行，把滚动**永久锁死**（html class 出现 `lenis-stopped`）。改为 Loader 同步写 `document.documentElement.dataset.loader`，SmoothScroll 初始化时读取并 `stop()`，Loader 完成时删标记并 `start()`——利用"子组件 effect 先于父组件执行"的特性保证时序确定。

### 3.3 Framer Motion 动画模式

| 模式 | 用途 | 实现 |
| --- | --- | --- |
| `variants` + stagger | Hero 五级入场编排 | `staggerChildren: 0.11, delayChildren: 0.08` |
| LineReveal | 大标题逐行上移 | 外层 `overflow-hidden`，内层 `y: "110%" → 0`，`viewport={{ once: true }}` |
| whileInView | 区块/卡片滚动入场 | `margin: "0px 0px -8% 0px"` 提前触发 |
| whileHover/Tap | 按钮物理反馈 | `scale: 0.985 / 0.96`，spring 500/30 |
| layout + AnimatePresence | 笔记增删重组 | `mode="popLayout"` |
| useSpring | 光标跟随 / 光斑视差 | stiffness/damping 分级 |
| useReducedMotion | 无障碍降级 | 所有动画条件化，reduce 时直接渲染终态 |

### 3.4 next/font 字体策略（LCP 关键）

```tsx
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],      // next/font 元数据里 SC 字体的合法子集
  variable: "--font-noto-sans",
  display: "swap",
  preload: false,          // 关键！见下方说明
});
```

**为什么 `preload: false`**：Noto Sans SC 的 Google CSS 返回约 100 个 unicode-range 子集块（CJK 按码位切片）。若开启 preload，next/font 会为每个子集生成 `<link rel="preload">`，近百个预请求会严重拖慢 LCP。关闭后浏览器只按实际渲染到的字符下载对应子集。等宽字体 JetBrains Mono 仅 latin 一个子集，保持 `preload: true`。

**为什么 `subsets: ["latin"]`**：next/font 的 `subsets` 只用于校验和 preload 决策——它拉取的 CSS 始终包含全部 CJK 块（已核实 `get-google-fonts-url.js` 不带 subset 参数）。传 `"chinese-simplified"` 会直接类型报错。

---

## 四、性能优化（Vercel 环境）

### 4.1 实测构建产物

```
Route (app)                  Size      First Load JS
┌ ○ /                       15.4 kB   162 kB      ← 静态预渲染
├ ○ /_not-found             990 B     104 kB
└ ○ /opengraph-image        123 B     103 kB      ← 构建期静态生成
```

- **全站静态**：除 OG 图外零服务端运行时，Vercel 上直接走 CDN 边缘缓存；
- **零位图**：全站 SVG/CSS，无 `next/image` 需求（未来加图时，LCP 图加 `priority`，其余懒加载）；
- 首屏 162 kB = React 运行时 103 kB + 页面 15.4 kB + Framer Motion/Lenis 等共享块，对于带动画站点属于优秀水平。

### 4.2 Lighthouse  checklist

| 项 | 状态 / 建议 |
| --- | --- |
| LCP | Hero H1 即 LCP 元素；字体自托管 + CJK 按需子集；无渲染阻塞资源 |
| CLS | 加载器 `fixed` 不占文档流；字体 `display: swap` + `adjustFontFallback`；无晚到布局元素 |
| TBT | 滚动监听用 ref 直改 DOM（Nav/ToTop）而非 setState，避免每帧重渲染 |
| 代码分割 | 单页应用按路由自动分割；笔记编辑器 `dynamic(ssr:false)` 再切一刀 |
| 压缩 | `compress: true`；Vercel 边缘自动 Brotli |
| 缓存 | 静态路由 `Cache-Control: public, max-age=...` 由 Vercel 自动处理 |

### 4.3 后续可选

- **Vercel Web Analytics**：`npm i @vercel/analytics` 后在 layout 引入，不影响性能分；
- **Turbopack 构建**：Next 15.5 可试 `npm run build:turbo`（本机 webpack 构建仅 2.6s，暂无必要）；
- **字体子集化**：若想进一步压缩，可用 `subfont` 按站点实际用字裁剪 CJK 子集，体积可再降 90%。

---

## 五、迁移兼容性

- 静态版完整保留在 `legacy-static/`，可直接双击打开；
- localStorage key（`edge32.roadmap.v1` / `edge32.notes.v1`）两版一致，**旧数据无缝继承**；
- 内容数据全部收敛到 `lib/data.ts`，加课程/改网盘只动一个文件。
