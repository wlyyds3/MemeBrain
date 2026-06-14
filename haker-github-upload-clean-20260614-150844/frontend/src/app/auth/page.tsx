import { AuthForm } from "@/components/auth-form";
import { Header } from "@/components/header";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <section className="flex flex-col justify-center">
          <div className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary">
            登录 / 注册
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground">
            用一个账号保存你的灵感流。
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
            当前版本使用 JWT 鉴权。注册后即可登录并将每次联想结果保存到个人历史记录中，方便反复打磨文案和二创脚本。
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4 text-sm text-muted">文本输入</div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4 text-sm text-muted">AI 联想</div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4 text-sm text-muted">历史保存</div>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </section>
      </main>
    </div>
  );
}
