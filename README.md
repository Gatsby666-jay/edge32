# EDGE32 — STM32 × 边缘人工智能学习站

Next.js 15（App Router）+ Tailwind CSS v4 + Framer Motion + Lenis。设计风格参考 [grilledpixels.com](https://www.grilledpixels.com/ecommerce/)：黑底白字、红色强调 `#EE344A`、超大粗体标题混排斜体衬线、滚动入场动效。

## 快速开始

```bash
npm install
npm run dev          # 开发服务器 http://localhost:3000
npm run dev:turbo    # Turbopack 开发模式（更快）
npm run build        # 生产构建
npm run start        # 预览生产构建
```

## 部署

### GitHub Pages（当前线上地址）

**线上地址**：https://gatsby666-jay.github.io/edge32/

部署结构：`main` 分支存源码，`gh-pages` 分支存静态导出产物，Pages 源设为 `gh-pages` 分支根目录。

```bash
# 1. 本地构建 Pages 产物（启用 output:export + basePath:/edge32）
GH_PAGES=true npm run build        # 产物在 out/

# 2. 推送产物到 gh-pages 分支（脚本方式，无需 workflow scope）
python scripts/deploy-ghpages.py   # 通过 GitHub API 推送 main + gh-pages
```

**重新部署流程**（改了 `lib/data.ts` 等内容后）：

1. `git add -A && git commit -m "..."`（提交到 main）
2. `python scripts/deploy-ghpages.py`（一条命令：推送 main 源码 + 重建 gh-pages 产物）
3. 等 1-2 分钟，Pages 自动构建生效

**可选：升级为 Actions 自动部署**

仓库根目录已准备好 `.github/workflows/deploy-pages.yml`（本地存在，因当前 Token 缺 `workflow` 作用域暂未入库）。启用方式二选一：

- 在 GitHub 网页端 **Add file → Create new file** 粘贴该工作流内容，再把 **Settings → Pages → Source** 改为 `GitHub Actions`
- 或给 Token 添加 `workflow` 作用域后执行 `git push`

之后每次 push 到 `main` 即自动构建部署。

### Vercel（可选备选）

1. 登录 [vercel.com](https://vercel.com) → **Add New → Project** → 导入本仓库
2. Framework 自动识别为 Next.js，默认即可，点击 **Deploy**
3. 之后每次 push 自动部署

**可选环境变量**

| 变量 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 站点正式域名，用于 OG 分享图绝对 URL |
| `GITHUB_REPOSITORY` | Actions 自动注入，Pages 构建时自动推导 `https://<owner>.github.io/<repo>` |

> 不设置也不会报错，`metadataBase` 会按环境自动回退。

## 目录结构

```
app/
  layout.tsx            # 根布局：next/font 三套字体、metadata、Provider 组装
  page.tsx              # 首页：六大区块组装（服务端组件）
  globals.css           # Tailwind v4 @theme 设计令牌 + 组件类
  icon.svg              # 像素芯片 favicon
.github/
  workflows/deploy-pages.yml   # GitHub Pages 自动部署
public/
  og.png                # 社交分享卡片（1200×630）
components/
  smooth-scroll.tsx     # Lenis 平滑滚动 Provider + 锚点处理
  cursor.tsx            # 自定义光标（红点 + 弹性圆环 + 悬停标签）
  loader.tsx            # 加载器（等 document.fonts.ready，锁定滚动）
  reveal.tsx            # Reveal / LineReveal 动效原语
  nav.tsx               # 导航（活动区块高亮 + 进度条 + 移动端菜单）
  marquee.tsx           # 跑马灯（纯 CSS）
  footer.tsx / to-top.tsx / cta-button.tsx / grain.tsx
  sections/             # hero / problem / roadmap / courses / resources / notes / notes-editor
lib/
  data.ts               # ★ 内容维护入口：阶段 / 课程 / 网盘 / 工具 / 社区
  storage.ts            # SSR 安全的 localStorage 封装
scripts/
  deploy-ghpages.py     # GitHub Pages 部署脚本（API 推送 main + gh-pages）
legacy-static/          # 纯静态版备份（index.html + assets/）
```

## 内容维护

**所有内容数据集中在 `lib/data.ts`**，改这里即可，页面自动渲染：

- `STAGES` — 六个学习阶段（目标 / 重点 / 关联课程）
- `COURSES` — 20 门课程（B站 / YouTube / 官方 MOOC）
- `PAN_RESOURCES` — 百度网盘（含提取码一键复制）
- `TOOLS` / `COMMUNITY` — 工具链与社区
- `PAINS` / `MARQUEE_WORDS` — 痛点卡片与跑马灯词

## 数据说明

- 学习路线进度：`localStorage["edge32.roadmap.v1"]`
- 学习笔记：`localStorage["edge32.notes.v1"]`
- 两者与旧静态版 key 一致，**已勾选的进度和已写的笔记会无缝保留**
- 笔记只在浏览器本地，清理浏览器数据前请先在笔记区「导出 .json」备份

## 优化要点速览

详见 [OPTIMIZATION.md](./OPTIMIZATION.md)：设计令牌体系、Server/Client 组件划分、next/font 策略（LCP）、Framer Motion 动画模式、Vercel 性能建议。

当前生产构建首屏 JS **162 kB**（含 Framer Motion + Lenis），全站静态预渲染，无位图资源。
