"use client";

import { useState } from "react";

/** 复制提取码按钮（客户端小岛） */
export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      onClick={copy}
      className={`whitespace-nowrap border px-4 py-2.5 font-mono text-[11.5px] tracking-[0.08em] transition-colors ${
        copied ? "border-red bg-red text-white" : "border-line text-ink hover:bg-red hover:border-red"
      }`}
    >
      {copied ? "已复制 ✓" : `复制提取码 ${text}`}
    </button>
  );
}
