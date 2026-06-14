import Link from "next/link";
import { ArrowRight, BookOpenText, BrainCircuit, Clapperboard, Flame, Sparkles } from "lucide-react";

import { Header } from "@/components/header";

const features = [
  {
    title: "文本输入",
    description: "输入一句话或一段文案，识别情绪、关系、场景。",
    icon: BrainCircuit,
  },
  {
    title: "热梗推荐",
    description: "根据语义自动匹配网络热梗，直接给出解释理由。",
    icon: Flame,
  },
  {
    title: "动漫推荐",
    description: "优先返回最适合表达情绪的动漫桥段和名场面。",
    icon: Clapperboard,
  },
  {
    title: "历史典故推荐",
    description: "用历史类比增强文案层次，适合短视频和图文创作。",
    icon: BookOpenText,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-grid bg-[size:36px_36px] opacity-30" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                MemeBrain MVP
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                把一句吐槽，瞬间联想到热梗、动漫和历史典故。
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                为自媒体创作者、视频剪辑师、B 站 UP 主和短视频团队设计的 AI 文化联想工作台。
                当前 MVP 聚焦文本输入与三类推荐，先把灵感命中率做出来。
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90"
                >
                  立即开始
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth?next=%2Fdashboard"
                  prefetch={false}
                  className="rounded-full border border-border/70 px-5 py-3 text-sm transition hover:border-primary/40 hover:text-primary"
                >
                  直接查看工作台
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-glow backdrop-blur">
                <div className="text-sm uppercase tracking-[0.18em] text-primary">示例联想</div>
                <div className="mt-4 rounded-[28px] border border-border/70 bg-background/70 p-5">
                  <div className="text-sm text-muted">输入文本</div>
                  <div className="mt-2 text-lg font-medium text-foreground">老板周末让我加班</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <div className="text-xs text-primary">情绪</div>
                    <div className="mt-2 text-sm font-medium text-foreground">绝望</div>
                  </div>
                  <div className="rounded-2xl bg-secondary/10 p-4">
                    <div className="text-xs text-foreground/70">关系</div>
                    <div className="mt-2 text-sm font-medium text-foreground">压迫</div>
                  </div>
                  <div className="rounded-2xl bg-accent/10 p-4">
                    <div className="text-xs text-foreground/70">场景</div>
                    <div className="mt-2 text-sm font-medium text-foreground">逃跑失败</div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="text-xs text-primary">热梗推荐</div>
                    <div className="mt-2 text-sm text-foreground">破防了 / 天塌了</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="text-xs text-primary">动漫推荐</div>
                    <div className="mt-2 text-sm text-foreground">猫和老鼠</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="text-xs text-primary">历史典故</div>
                    <div className="mt-2 text-sm text-foreground">四面楚歌</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-[28px] border border-border/70 bg-card/85 p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-foreground">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
