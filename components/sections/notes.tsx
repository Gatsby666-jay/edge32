"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { LineReveal } from "@/components/reveal";
import { NOTES_KEY, STAGES, stageName, type Note } from "@/lib/data";
import { loadJSON, saveJSON } from "@/lib/storage";

const NoteEditor = dynamic(() => import("./notes-editor"), { ssr: false });

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FILTERS = [{ key: "all", label: "全部" }, ...STAGES.map((s) => ({ key: s.id, label: `${s.num} ${s.name}` }))];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);

  useEffect(() => {
    setNotes(loadJSON<Note[]>(NOTES_KEY, []));
  }, []);

  const persist = (next: Note[]) => {
    setNotes(next);
    saveJSON(NOTES_KEY, next);
  };

  const list = filter === "all" ? notes : notes.filter((n) => n.stage === filter);
  const editingNote = editing?.id ? notes.find((n) => n.id === editing.id) ?? null : null;

  const download = (filename: string, text: string, mime?: string) => {
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const exportMd = () => {
    if (!notes.length) return void alert("还没有笔记可导出。");
    const date = new Date().toISOString().slice(0, 10);
    const md = notes
      .slice()
      .sort((a, b) => b.updated - a.updated)
      .map(
        (n) =>
          `---\n# ${n.title || "未命名笔记"}\n\n> 阶段：${n.stage ? stageName(n.stage) : "未分类"} · 更新于 ${new Date(n.updated).toLocaleString("zh-CN")}\n\n${n.content || ""}\n`
      )
      .join("\n---\n");
    download(`edge32-notes-${date}.md`, md);
  };

  const exportJson = () => {
    if (!notes.length) return void alert("还没有笔记可导出。");
    const date = new Date().toISOString().slice(0, 10);
    download(
      `edge32-notes-${date}.json`,
      JSON.stringify({ app: "edge32", version: 1, notes }, null, 2),
      "application/json"
    );
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(String(reader.result));
        const arr: unknown[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { notes?: unknown[] })?.notes)
            ? ((data as { notes: unknown[] }).notes)
            : [];
        if (!arr.length) throw new Error("bad format");
        let added = 0;
        const next = [...notes];
        arr.forEach((n) => {
          if (n && typeof n === "object" && ((n as Note).title || (n as Note).content)) {
            const item = n as Note;
            next.push({
              id: item.id || `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
              title: String(item.title || ""),
              content: String(item.content || ""),
              stage: STAGES.some((s) => s.id === item.stage) ? item.stage : "",
              updated: Number(item.updated) || Date.now(),
            });
            added++;
          }
        });
        persist(next);
        alert(`成功导入 ${added} 篇笔记。`);
      } catch {
        alert("导入失败：文件不是有效的笔记 JSON。");
      }
    };
    reader.readAsText(file, "utf-8");
  };

  return (
    <section id="notes" className="sec px-gutter">
      <div className="sec-head">
        <Reveal as="p" className="eyebrow">
          (05) NOTES
        </Reveal>
        <LineReveal
          as="h2"
          className="h-section mt-[clamp(20px,3vw,36px)]"
          lines={[
            <>学习笔记，</>,
            <>
              记录每一次 <em className="accent">恍然大悟</em>
            </>,
          ]}
        />
        <Reveal as="p" className="lead mt-[clamp(18px,2.4vw,30px)]" delay={0.2}>
          笔记仅保存在你的浏览器本地（localStorage），<em>不上传任何服务器</em>。建议定期导出备份，换电脑时用 JSON 导入即可迁移。
        </Reveal>
      </div>

      <Reveal className="mb-[clamp(28px,4vw,44px)] flex flex-wrap items-center justify-between gap-3" delay={0.1}>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`border px-5 py-[11px] font-mono text-xs tracking-[0.12em] uppercase transition-all duration-280 ${
                filter === f.key ? "border-ink bg-ink text-bg" : "border-linesoft text-muted hover:border-line hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs tracking-[0.08em] text-faint">
            {notes.length} 篇笔记 · 显示 {list.length}
          </span>
          <button onClick={exportMd} className="border border-linesoft px-4 py-2.5 font-mono text-xs tracking-[0.08em] text-muted transition-colors hover:border-line hover:text-ink">
            导出 .md
          </button>
          <button onClick={exportJson} className="border border-linesoft px-4 py-2.5 font-mono text-xs tracking-[0.08em] text-muted transition-colors hover:border-line hover:text-ink">
            导出 .json
          </button>
          <label className="cursor-pointer border border-linesoft px-4 py-2.5 font-mono text-xs tracking-[0.08em] text-muted transition-colors hover:border-line hover:text-ink">
            导入 .json
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.target.value = "";
              }}
            />
          </label>
          <button
            onClick={() => setEditing({ id: null })}
            className="border border-red bg-red px-4 py-2.5 font-mono text-xs tracking-[0.08em] text-white transition-colors hover:bg-[#ff1f3d]"
          >
            + 新建笔记
          </button>
        </div>
      </Reveal>

      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        <AnimatePresence mode="popLayout">
          {list.length ? (
            list
              .slice()
              .sort((a, b) => b.updated - a.updated)
              .map((n, i) => (
                <motion.article
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3), ease: EASE }}
                  className="flex min-h-[170px] flex-col gap-3 border border-linesoft bg-bg2 p-[22px] transition-[border-color,transform] duration-350 hover:-translate-y-0.5 hover:border-red"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-bold leading-[1.4] break-all">{n.title || "未命名笔记"}</h4>
                    <span
                      className={`flex-none border px-2 py-[3px] font-mono text-[10.5px] tracking-[0.08em] ${
                        n.stage ? "border-red text-red" : "border-linesoft text-faint"
                      }`}
                    >
                      {n.stage ? stageName(n.stage) : "未分类"}
                    </span>
                  </div>
                  <div className="line-clamp-5 flex-1 overflow-hidden text-[13px] leading-[1.75] break-all whitespace-pre-wrap text-muted">
                    {n.content || "（空白）"}
                  </div>
                  <div className="flex items-center justify-between border-t border-linesoft pt-3 font-mono text-[11px] text-faint">
                    <span>{new Date(n.updated).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })}</span>
                    <span className="flex gap-1.5">
                      <button onClick={() => setEditing({ id: n.id })} className="border border-linesoft px-2.5 py-1 transition-colors hover:border-red hover:text-red">
                        编辑
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`确定删除笔记「${n.title || "未命名笔记"}」吗？`)) {
                            persist(notes.filter((x) => x.id !== n.id));
                          }
                        }}
                        className="border border-linesoft px-2.5 py-1 transition-colors hover:border-red hover:bg-red hover:text-white"
                      >
                        删除
                      </button>
                    </span>
                  </div>
                </motion.article>
              ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full border border-dashed border-line px-6 py-[clamp(44px,7vw,88px)] text-center text-muted"
            >
              <div className="mb-3 font-serif text-[clamp(20px,2.6vw,28px)] italic text-ink">
                {notes.length ? "该阶段还没有笔记" : "还没有写过笔记"}
              </div>
              <p className="text-sm">
                {notes.length ? "切换到「全部」，或点击右上角新建一篇。" : "点击「+ 新建笔记」，记录今天搞懂的那个知识点。"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editing && (
          <NoteEditor
            key="editor"
            note={editingNote}
            onClose={() => setEditing(null)}
            onSave={(data) => {
              if (editing.id) {
                persist(
                  notes.map((n) => (n.id === editing.id ? { ...n, ...data, updated: Date.now() } : n))
                );
              } else {
                persist([
                  ...notes,
                  {
                    id: `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
                    title: data.title,
                    content: data.content,
                    stage: data.stage,
                    updated: Date.now(),
                  },
                ]);
              }
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
