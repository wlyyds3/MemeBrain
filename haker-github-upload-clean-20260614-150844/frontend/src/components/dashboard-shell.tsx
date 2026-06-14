"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCopy, FileText, LoaderCircle, RefreshCw } from "lucide-react";

import { AnalysisForm } from "@/components/analysis-form";
import { Header } from "@/components/header";
import { HistoryPanel } from "@/components/history-panel";
import { MediaReserveCard } from "@/components/media-reserve-card";
import { RecommendationCard } from "@/components/recommendation-card";
import {
  api,
  type AnalysisResult,
  type CopyPlatform,
  type CopyStyle,
  type FeedbackAction,
  type HistoryItem,
  type PlatformCopy,
  type Recommendation,
  type TextAnalysisResult,
} from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

function historyToResult(item: HistoryItem): TextAnalysisResult {
  return {
    mode: "text",
    analysis: {
      emotion: item.emotion,
      relationship: item.relationship,
      scene: item.scene,
      concepts: Array.from(new Set(item.recommendations.flatMap((recommendation) => recommendation.concepts ?? []))).slice(0, 6),
      search_focus: null,
    },
    recommendations: item.recommendations,
    source: "fallback",
    vector_search_enabled: item.recommendations.some((recommendation) => recommendation.retrieval_methods?.includes("vector")),
    reserved_capabilities: {
      image: true,
      video: true,
    },
  };
}

const platformLabel: Record<CopyPlatform, string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
  bilibili: "B 站",
};

const styleOptions: Array<{ value: CopyStyle; label: string }> = [
  { value: "balanced", label: "均衡" },
  { value: "funny", label: "搞笑" },
  { value: "sharp", label: "犀利" },
  { value: "warm", label: "温柔" },
  { value: "cinematic", label: "影视感" },
];

const platformOptions: CopyPlatform[] = ["douyin", "xiaohongshu", "bilibili"];

export function DashboardShell() {
  const router = useRouter();
  const { token, user, hydrated, markHydrated } = useAuthStore();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentInput, setCurrentInput] = useState("");
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyEmotion, setHistoryEmotion] = useState("");
  const [historyScene, setHistoryScene] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copies, setCopies] = useState<PlatformCopy[]>([]);
  const [copywritingLoading, setCopywritingLoading] = useState(false);
  const [copywritingError, setCopywritingError] = useState<string | null>(null);
  const [copyStyle, setCopyStyle] = useState<CopyStyle>("balanced");
  const [selectedPlatforms, setSelectedPlatforms] = useState<CopyPlatform[]>(["douyin", "xiaohongshu", "bilibili"]);
  const [focusRecommendationId, setFocusRecommendationId] = useState<string | null>(null);
  const [variantSeed, setVariantSeed] = useState(0);

  useEffect(() => {
    markHydrated();
  }, [markHydrated]);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/auth");
    }
  }, [hydrated, router, token]);

  const historyFilters = useMemo(
    () => ({ q: historyQuery, emotion: historyEmotion, scene: historyScene, limit: 50 }),
    [historyEmotion, historyQuery, historyScene],
  );

  const loadHistory = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const items = await api.history(token, historyFilters);
      setHistory(items);
    } catch {
      setHistory([]);
    }
  }, [historyFilters, token]);

  useEffect(() => {
    if (token) {
      void loadHistory();
    }
  }, [loadHistory, token]);

  function handleResult(value: AnalysisResult, inputText?: string) {
    setResult(value);
    setCopies([]);
    setCopywritingError(null);
    setFeedbackMessage(null);
    setActiveHistoryId(null);
    setFocusRecommendationId(value.mode === "text" ? value.recommendations[0]?.id ?? null : null);
    if (inputText) {
      setCurrentInput(inputText);
    }
  }

  async function handleFeedback(item: Recommendation, action: FeedbackAction) {
    if (!token) {
      return;
    }
    await api.feedback(token, {
      history_id: activeHistoryId,
      recommendation_id: item.id,
      category: item.category,
      title: item.title,
      action,
    });
    const label = action === "useful" ? "有用" : action === "not_accurate" ? "不准" : action === "favorite" ? "收藏" : "不喜欢";
    setFeedbackMessage(`已记录反馈：${label}。下次分析会参考这些偏好。`);
  }

  async function handleDeleteHistory(id: string) {
    if (!token) {
      return;
    }
    await api.deleteHistory(token, id);
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
    await loadHistory();
  }

  function handleRestoreHistory(item: HistoryItem) {
    const restored = historyToResult(item);
    setResult(restored);
    setCurrentInput(item.input_text);
    setActiveHistoryId(item.id);
    setFocusRecommendationId(restored.recommendations[0]?.id ?? null);
    setCopies([]);
    setCopywritingError(null);
    setFeedbackMessage("已从历史记录恢复结果");
  }

  function togglePlatform(platform: CopyPlatform) {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) {
        return current.length === 1 ? current : current.filter((item) => item !== platform);
      }
      return [...current, platform];
    });
  }

  async function handleCopywriting(nextVariantSeed = variantSeed) {
    if (!token || !result || result.mode !== "text") {
      return;
    }
    setCopywritingLoading(true);
    setCopywritingError(null);
    try {
      const response = await api.copywriting(token, {
        input_text: currentInput || "历史记录输入",
        analysis: result.analysis,
        recommendations: result.recommendations,
        platforms: selectedPlatforms,
        style: copyStyle,
        focus_recommendation_id: focusRecommendationId,
        variant_seed: nextVariantSeed,
      });
      setCopies(response.copies);
    } catch (error) {
      setCopywritingError(error instanceof Error ? error.message : "生成文案失败");
    } finally {
      setCopywritingLoading(false);
    }
  }

  function regenerateCopywriting() {
    const nextSeed = variantSeed + 1;
    setVariantSeed(nextSeed);
    void handleCopywriting(nextSeed);
  }

  async function copyPlatformText(copy: PlatformCopy) {
    await navigator.clipboard.writeText(`${copy.title}\n\n${copy.body}\n\n${copy.tags.map((tag) => `#${tag}`).join(" ")}`);
  }

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
          <div className="text-sm text-muted">正在加载工作台...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[32px] border border-border/60 bg-card/60 p-6 shadow-glow sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-primary">MVP Workspace</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                你好，{user.name}。把一句话变成具体画面、台词和创作方案。
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                当前版本会参考你的反馈调整推荐排序，也可以按平台和风格生成不同版本的创作文案。
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted">
              已登录：<span className="text-foreground">{user.email}</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6">
            <AnalysisForm onResult={handleResult} onRefreshHistory={loadHistory} />

            {result && (
              <section className="rounded-[28px] border border-border/70 bg-card/85 p-6 shadow-glow">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">联想结果</h2>
                    <p className="mt-1 text-sm text-muted">
                      {result.mode === "text"
                        ? `分析来源：${
                            activeHistoryId
                              ? "历史记录"
                              : result.source === "deepseek"
                                ? "DeepSeek 模型"
                                : result.source === "openai"
                                  ? "OpenAI 模型"
                                  : "本地规则引擎"
                          }`
                        : "当前展示的是多模态接口状态"}
                    </p>
                  </div>
                  {result.mode === "text" ? (
                    <div className="flex flex-wrap gap-2 text-xs text-muted">
                      <span className="rounded-full bg-primary/10 px-3 py-2 text-primary">情绪：{result.analysis.emotion}</span>
                      <span className="rounded-full bg-secondary/20 px-3 py-2">关系：{result.analysis.relationship}</span>
                      <span className="rounded-full bg-accent/15 px-3 py-2">场景：{result.analysis.scene}</span>
                      {result.analysis.concepts.slice(0, 4).map((concept) => (
                        <span key={concept} className="rounded-full bg-background px-3 py-2">
                          概念：{concept}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {feedbackMessage ? <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary">{feedbackMessage}</div> : null}

                {result.mode === "text" ? (
                  <>
                    <div className="mb-5 rounded-2xl border border-border/70 bg-background/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-foreground">平台文案生成</div>
                          <div className="mt-1 text-xs text-muted">选择平台、风格和主桥段，可以反复生成不同版本。</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCopywriting()}
                            disabled={copywritingLoading}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-50"
                          >
                            {copywritingLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                            生成文案
                          </button>
                          <button
                            type="button"
                            onClick={regenerateCopywriting}
                            disabled={copywritingLoading || copies.length === 0}
                            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2.5 text-sm text-muted transition hover:text-foreground disabled:opacity-50"
                          >
                            <RefreshCw className="h-4 w-4" />
                            重新生成
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-3">
                        <div>
                          <div className="mb-2 text-xs text-muted">平台</div>
                          <div className="flex flex-wrap gap-2">
                            {platformOptions.map((platform) => (
                              <button
                                key={platform}
                                type="button"
                                onClick={() => togglePlatform(platform)}
                                className={`rounded-full border px-3 py-2 text-xs transition ${
                                  selectedPlatforms.includes(platform)
                                    ? "border-primary/50 bg-primary/10 text-primary"
                                    : "border-border/70 text-muted hover:text-foreground"
                                }`}
                              >
                                {platformLabel[platform]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <label className="block">
                          <span className="mb-2 block text-xs text-muted">风格</span>
                          <select
                            value={copyStyle}
                            onChange={(event) => setCopyStyle(event.target.value as CopyStyle)}
                            className="w-full rounded-2xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm outline-none"
                          >
                            {styleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs text-muted">主桥段</span>
                          <select
                            value={focusRecommendationId ?? ""}
                            onChange={(event) => setFocusRecommendationId(event.target.value || null)}
                            className="w-full rounded-2xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm outline-none"
                          >
                            <option value="">自动选择</option>
                            {result.recommendations.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.title}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    {copywritingError ? <div className="mb-5 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">{copywritingError}</div> : null}

                    {copies.length ? (
                      <div className="mb-6 grid gap-4 lg:grid-cols-3">
                        {copies.map((copy) => (
                          <article key={copy.platform} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <div className="text-sm font-medium text-primary">{platformLabel[copy.platform]}</div>
                              <button
                                type="button"
                                onClick={() => void copyPlatformText(copy)}
                                className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-1 text-xs text-muted transition hover:text-foreground"
                              >
                                <ClipboardCopy className="h-3.5 w-3.5" />
                                复制
                              </button>
                            </div>
                            <h3 className="text-sm font-semibold leading-6 text-foreground">{copy.title}</h3>
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">{copy.body}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted">
                              {copy.tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-card px-2 py-1">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      {result.recommendations.map((item) => (
                        <RecommendationCard key={item.id} item={item} onFeedback={handleFeedback} />
                      ))}
                    </div>
                  </>
                ) : (
                  <MediaReserveCard result={result} />
                )}
              </section>
            )}
          </div>

          <HistoryPanel
            items={history}
            query={historyQuery}
            emotion={historyEmotion}
            scene={historyScene}
            onQueryChange={setHistoryQuery}
            onEmotionChange={setHistoryEmotion}
            onSceneChange={setHistoryScene}
            onDelete={handleDeleteHistory}
            onRestore={handleRestoreHistory}
          />
        </div>
      </main>
    </div>
  );
}