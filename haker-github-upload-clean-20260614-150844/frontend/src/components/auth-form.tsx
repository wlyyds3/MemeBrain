"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

type Mode = "login" | "register";
const DEFAULT_ADMIN_EMAIL = "admin@memebrain.com";
const DEFAULT_ADMIN_PASSWORD = "Admin123456";
const SHOW_DEV_ADMIN = process.env.NODE_ENV === "development";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const title = useMemo(() => (mode === "login" ? "欢迎回来" : "创建账号"), [mode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "register") {
        await api.register({ name, email, password });
      }
      const result = await api.login({ email, password });
      setAuth(result.access_token, result.user);
      router.replace("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  function fillAdminAccount() {
    setMode("login");
    setEmail(DEFAULT_ADMIN_EMAIL);
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setMessage("已填入开发环境管理员账号，可直接登录。");
  }

  return (
    <div className="w-full rounded-[28px] border border-border/70 bg-card/80 p-6 shadow-glow backdrop-blur md:p-8">
      <div className="mb-6 flex rounded-full bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
            mode === "login" ? "bg-primary text-slate-950" : "text-muted hover:text-foreground"
          }`}
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
            mode === "register" ? "bg-primary text-slate-950" : "text-muted hover:text-foreground"
          }`}
        >
          注册
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          登录后即可保存你的文本联想历史，并体验热梗、动漫、历史典故三类推荐。
        </p>
        {SHOW_DEV_ADMIN && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 p-4 text-sm text-foreground/90">
          <div className="font-medium">开发环境默认管理员</div>
          <div className="mt-2 text-muted">邮箱：{DEFAULT_ADMIN_EMAIL}</div>
          <div className="text-muted">密码：{DEFAULT_ADMIN_PASSWORD}</div>
          <button
            type="button"
            onClick={fillAdminAccount}
            className="mt-3 rounded-full border border-primary/30 px-3 py-2 text-xs text-primary transition hover:bg-primary/10"
          >
            一键填充管理员账号
          </button>
        </div>
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <label className="block">
            <span className="mb-2 block text-sm text-muted">昵称</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 outline-none transition focus:border-primary/60"
              placeholder="请输入昵称"
              required
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm text-muted">邮箱</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 outline-none transition focus:border-primary/60"
            placeholder="name@example.com"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-muted">密码</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 outline-none transition focus:border-primary/60"
            placeholder="至少 6 位"
            minLength={6}
            required
          />
        </label>

        {message && <p className="rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-primary px-4 py-3 font-medium text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "处理中..." : mode === "login" ? "登录并进入工作台" : "注册并登录"}
        </button>
      </form>
    </div>
  );
}


