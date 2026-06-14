"use client";

import { BookOpenText, Bookmark, Clapperboard, Copy, Film, Flame, Quote, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";

import type { FeedbackAction, Recommendation } from "@/lib/api";

const iconMap = {
  meme: Flame,
  anime: Clapperboard,
  history: BookOpenText,
  film: Film,
};

const labelMap = {
  meme: "热梗推荐",
  anime: "动漫推荐",
  history: "历史典故",
  film: "影视桥段",
};

const feedbackButtons: Array<{ action: FeedbackAction; label: string; Icon: typeof ThumbsUp }> = [
  { action: "useful", label: "有用", Icon: ThumbsUp },
  { action: "not_accurate", label: "不准", Icon: XCircle },
  { action: "favorite", label: "收藏", Icon: Bookmark },
  { action: "dislike", label: "不喜欢", Icon: ThumbsDown },
];

type Props = {
  item: Recommendation;
  onFeedback?: (item: Recommendation, action: FeedbackAction) => Promise<void>;
};

export function RecommendationCard({ item, onFeedback }: Props) {
  const Icon = iconMap[item.category];

  async function copyText() {
    const parts = [item.title, item.scene_description || item.summary, item.quote?.text ? `推荐台词：${item.quote.text}` : null, item.reason].filter(Boolean);
    await navigator.clipboard.writeText(parts.join("\n\n"));
  }

  return (
    <article className="rounded-[24px] border border-border/70 bg-card/90 p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted">
          <Icon className="h-3.5 w-3.5" />
          {labelMap[item.category]}
        </div>
        <div className="text-xs text-primary">{Math.round(item.score * 100)}% 匹配</div>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
      {item.work_title ? <div className="mt-2 text-sm text-primary/90">出处：{item.work_title}</div> : null}
      {item.scene_title ? <div className="mt-1 text-sm text-foreground/90">画面：{item.scene_title}</div> : null}
      {item.episode_label || (item.timestamp_start && item.timestamp_end) ? (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
          {item.episode_label ? <span className="rounded-full border border-border/70 px-2 py-1">{item.episode_label}</span> : null}
          {item.timestamp_start && item.timestamp_end ? (
            <span className="rounded-full border border-border/70 px-2 py-1">
              {item.timestamp_start} - {item.timestamp_end}
            </span>
          ) : null}
        </div>
      ) : null}
      {item.retrieval_methods?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.retrieval_methods.map((method) => (
            <span key={method} className="rounded-full bg-background px-2 py-1 text-[11px] text-muted">
              {method === "vector" ? "向量召回" : "规则匹配"}
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-muted">{item.scene_description || item.summary}</p>
      {item.quote?.text ? (
        <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-500/8 p-4">
          <div className="mb-2 inline-flex items-center gap-2 text-xs text-sky-300">
            <Quote className="h-3.5 w-3.5" />
            推荐台词{item.quote.verified ? " · 已校验" : ""}
          </div>
          <div className="text-sm leading-6 text-foreground/90">“{item.quote.text}”</div>
          {item.quote.speaker ? <div className="mt-2 text-xs text-muted">说话人：{item.quote.speaker}</div> : null}
        </div>
      ) : null}
      <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/8 p-4 text-sm leading-6 text-foreground/90">{item.reason}</div>
      {item.concepts?.length ? (
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted">
          {item.concepts.slice(0, 5).map((concept) => (
            <span key={concept} className="rounded-full bg-background px-2 py-1">
              概念：{concept}
            </span>
          ))}
        </div>
      ) : null}
      {item.reason_meta?.matched_signals?.length ? (
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted">
          {item.reason_meta.matched_signals.slice(0, 4).map((signal) => (
            <span key={signal} className="rounded-full border border-border/70 px-2 py-1">
              {signal}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
        {feedbackButtons.map(({ action, label, Icon: FeedbackIcon }) => (
          <button
            key={action}
            type="button"
            onClick={() => void onFeedback?.(item, action)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted transition hover:border-primary/50 hover:text-foreground"
          >
            <FeedbackIcon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void copyText()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted transition hover:border-primary/50 hover:text-foreground"
        >
          <Copy className="h-3.5 w-3.5" />
          复制
        </button>
      </div>
    </article>
  );
}