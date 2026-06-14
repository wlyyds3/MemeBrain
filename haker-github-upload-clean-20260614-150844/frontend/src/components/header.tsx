"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/lib/auth-store";

export function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  function handleLogout() {
    clearAuth();
    router.replace("/auth");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" prefetch={false} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-glow">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.18em] text-primary">MEMEBRAIN</div>
            <div className="text-xs text-muted">AI 文化联想引擎</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/dashboard"
                prefetch={false}
                className="rounded-full border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/50 hover:text-primary"
              >
                工作台
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                退出
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90"
            >
              登录体验
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
