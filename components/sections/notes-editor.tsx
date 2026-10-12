"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { STAGES, type Note } from "@/lib/data";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface NoteDraft {
  title: string;
  content: string;
  stage: string;
}

/** 笔记编辑器弹窗（next/dynamic 懒加载） */
export default function NoteEditor({
  note,
  onClose,
  onSave,
}: {
  note: Note | null;
  onClose: () => void;
  onSave: (draft: NoteDraft) => void;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [stage, setStage] = useState(note?.stage ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    if (!title.trim() && !content.trim()) {
      alert("标题和内容不能都为空。");
      return;
    }
    onSave({ title: title.trim(), content, stage });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-[rgba(5,5,5,0.82)] p-gutter backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="flex max-h-[88vh] w-[min(760px,100%)] flex-col border border-line bg-bg2"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div className="flex items-center justify-between border-b border-linesoft px-[26px] py-5">
          <span className="font-mono text-xs tracking-[0.14em] uppercase text-red">
            {note ? "EDIT NOTE // 编辑笔记" : "NEW NOTE // 新建笔记"}
          </span>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="grid h-[34px] w-[34px] place-items-center border border-linesoft font-mono text-lg text-muted transition-colors hover:border-red hover:bg-red hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-[18px] overflow-y-auto p-[26px]">
          <div>
            <label htmlFor="note-title" className="mb-2 block font-mono text-[11px] tracking-[0.14em] uppercase text-faint">
              标题
            </label>
            <input
              id="note-title"
              ref={titleRef}
              type="text"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：DMA 半传输中断踩坑记录"
              className="w-full border border-linesoft bg-bg px-[15px] py-[13px] text-[14.5px] text-ink transition-colors focus:border-red focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="note-stage" className="mb-2 block font-mono text-[11px] tracking-[0.14em] uppercase text-faint">
              所属阶段
            </label>
            <select
              id="note-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full border border-linesoft bg-bg px-[15px] py-[13px] text-[14.5px] text-ink transition-colors focus:border-red focus:outline-none"
            >
              <option value="">未分类</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.num} · {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="note-content" className="mb-2 block font-mono text-[11px] tracking-[0.14em] uppercase text-faint">
              内容（支持 Markdown 基础语法）
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"# 今天学到了什么？\n\n## 问题\n描述你遇到的问题……\n\n## 解决\n- 第一步\n- 第二步"}
              className="min-h-[260px] w-full resize-y border border-linesoft bg-bg px-[15px] py-[13px] text-sm leading-[1.8] text-ink transition-colors focus:border-red focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-linesoft px-[26px] py-[18px]">
          <button onClick={onClose} className="border border-linesoft px-4 py-2.5 font-mono text-xs tracking-[0.08em] text-muted transition-colors hover:border-line hover:text-ink">
            取消
          </button>
          <button onClick={save} className="border border-red bg-red px-4 py-2.5 font-mono text-xs tracking-[0.08em] text-white transition-colors hover:bg-[#ff1f3d]">
            保存笔记
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
