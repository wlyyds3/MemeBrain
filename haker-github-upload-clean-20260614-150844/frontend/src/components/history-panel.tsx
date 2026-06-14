"use client";

import { RotateCcw, Search, Trash2 } from "lucide-react";

import type { HistoryItem } from "@/lib/api";

type Props = {
  items: HistoryItem[];
  query: string;
  emotion: string;
  scene: string;
  onQueryChange: (value: string) => void;
  onEmotionChange: (value: string) => void;
  onSceneChange: (value: string) => void;
  onDelete: (id: string) => Promise<void>;
  onRestore: (item: HistoryItem) => void;
};

export function HistoryPanel({ items, query, emotion, scene, onQueryChange, onEmotionChange, onSceneChange, onDelete, onRestore }: Props) {
  const emotions = Array.from(new Set(items.map((item) => item.emotion))).filter(Boolean);
  const scenes = Array.from(new Set(items.map((item) => item.scene))).filter(Boolean);

  return (
    <section className="rounded-[28px] border border-border/70 bg-card/85 p-6 shadow-glow">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">历史记录</h2>
        <p className="mt-1 text-sm text-muted">搜索、筛选、删除，也可以把旧结果重新放回工作区继续创作。</p>
      </div>

      <div className="mb-5 space-y-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background/70 py-3 pl-9 pr-3 text-sm outline-none transition focus:border-primary/60"
            placeholder="搜索历史输入"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={emotion}
            onChange={(event) => onEmotionChange(event.target.value)}
            className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3 text-sm outline-none"
          >
            <option value="">全部情绪</option>
            {emotions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            value={scene}
            onChange={(event) => onSceneChange(event.target.value)}
            className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3 text-sm outline-none"
          >
            <option value="">全部场景</option>
            {scenes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted">还没有符合条件的历史记录。</div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <div className="text-sm leading-6 text-foreground">{item.input_text}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">情绪：{item.emotion}</span>
                <span className="rounded-full bg-secondary/20 px-2 py-1">关系：{item.relationship}</span>
                <span className="rounded-full bg-accent/15 px-2 py-1">场景：{item.scene}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onRestore(item)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-2 text-xs text-muted transition hover:border-primary/50 hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  回看结果
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}