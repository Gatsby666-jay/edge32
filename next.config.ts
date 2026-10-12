import type { NextConfig } from "next";

/*
 * GitHub Pages 部署配置
 * - 本地/常规构建：保持默认（支持 next start 本地预览）
 * - Pages 构建（GH_PAGES=true）：静态导出 + basePath/assetPrefix 指向 /edge32
 */
const isGithubPages = process.env.GH_PAGES === "true";
const repoName = "edge32";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
