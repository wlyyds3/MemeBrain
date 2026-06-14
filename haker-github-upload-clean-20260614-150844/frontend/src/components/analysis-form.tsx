"use client";

import { useState } from "react";
import { ImagePlus, LoaderCircle, Video, WandSparkles } from "lucide-react";

import type { AnalysisResult } from "@/lib/api";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

type Props = {
  onResult: (value: AnalysisResult, inputText?: string) => void;
  onRefreshHistory: () => Promise<void>;
};

export function AnalysisForm({ onResult, onRefreshHistory }: Props) {
  const token = useAuthStore((state) => state.token);
  const [mode, setMode] = useState<"text" | "image" | "video">("text");
  const [text, setText] = useState("老板周末让我加班");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError("请先登录");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result =
        mode === "text"
          ? await api.analyze(token, text)
          : mode === "image"
            ? file
              ? await api.analyzeImage(token, file)
              : (() => {
                  throw new Error("请先选择图片文件");
                })()
            : file
              ? await api.analyzeVideo(token, file)
              : (() => {
                  throw new Error("请先选择视频文件");
                })();
      onResult(result, mode === "text" ? text : file?.name);
      if (mode === "text") {
        await onRefreshHistory();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "联想失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-border/70 bg-card/85 p-6 shadow-glow">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">文本联想输入</h2>
        <p className="mt-1 text-sm text-muted">
          当前会尽量返回更具体的作品桥段、推荐台词、场景说明，以及可用的集数和时间点。
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              mode === "text" ? "bg-primary text-slate-950" : "border border-border/70 bg-background/70 text-muted"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <WandSparkles className="h-4 w-4" />
              文本联想
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("image")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              mode === "image" ? "bg-primary text-slate-950" : "border border-border/70 bg-background/70 text-muted"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="h-4 w-4" />
              图片联想预留
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("video")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              mode === "video" ? "bg-primary text-slate-950" : "border border-border/70 bg-background/70 text-muted"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Video className="h-4 w-4" />
              视频联想预留
            </span>
          </button>
        </div>

        {mode === "text" ? (
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-[180px] w-full rounded-[24px] border border-border/70 bg-background/80 px-5 py-4 text-sm leading-7 outline-none transition focus:border-primary/60"
            placeholder="例如：老板周末让我加班"
          />
        ) : (
          <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-background/50 px-5 py-6 text-center">
            <input
              type="file"
              className="hidden"
              accept={mode === "image" ? "image/png,image/jpeg,image/webp" : "video/mp4,video/quicktime,video/webm"}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <div className="text-sm text-muted">
              {file ? `已选择：${file.name}` : mode === "image" ? "点击上传图片文件" : "点击上传视频文件"}
            </div>
            <div className="mt-2 text-xs text-muted">
              {mode === "image" ? "当前为图片联想接口预留模式" : "当前为视频联想接口预留模式"}
            </div>
          </label>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted">
            {mode === "text" ? `${text.length} / 2000` : file ? "文件已准备提交" : "请选择文件"}
          </div>
          <button
            type="submit"
            disabled={loading || (mode === "text" ? text.trim().length < 2 : !file)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
            {loading ? "处理中..." : mode === "text" ? "开始联想" : "提交预留接口"}
          </button>
        </div>

        {error && <p className="mt-4 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">{error}</p>}
      </form>
    </section>
  );
}
