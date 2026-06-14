import type { MediaReservationResult } from "@/lib/api";

export function MediaReserveCard({ result }: { result: MediaReservationResult }) {
  return (
    <section className="rounded-[28px] border border-border/70 bg-card/85 p-6 shadow-glow">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {result.mode === "image" ? "图片联想预留" : "视频联想预留"}
        </h2>
        <p className="mt-1 text-sm text-muted">{result.message}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
          <div className="text-xs text-muted">状态</div>
          <div className="mt-2 text-sm font-medium text-foreground">
            {result.enabled ? "接口已开启" : "接口已预留"}
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
          <div className="text-xs text-muted">支持格式</div>
          <div className="mt-2 text-sm leading-6 text-foreground">{result.accepted_types.join(" / ")}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
          <div className="text-xs text-muted">推荐模型</div>
          <div className="mt-2 text-sm leading-6 text-foreground">{result.recommended_models.join(" / ")}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/8 p-4">
        <div className="text-sm font-medium text-foreground">规划中的处理链路</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.planned_pipeline.map((step) => (
            <span key={step} className="rounded-full bg-background px-3 py-2 text-xs text-muted">
              {step}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
