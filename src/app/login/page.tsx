'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, KeyRound, ArrowRight, Loader2, Database, Lock } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('请输入管理员访问密码');
      return;
    }

    setError('');
    startTransition(async () => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '访问拒绝：密码错误');
          return;
        }

        router.push('/dashboard');
        router.refresh();
      } catch {
        setError('网络连接异常，请重试');
      }
    });
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background ambient glowing spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-indigo-950/50">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 ring-1 ring-white/20">
              <Database className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DeepSeek Exporter
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-indigo-400/90 font-medium tracking-wide">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GOD MODE · 独立数据库管理台</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              ds.aikeyu.cn · 核心数据上帝视角
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>管理端访问密码</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入 Vercel 环境变量中配置的密码"
                  autoFocus
                  disabled={isPending}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 pr-10"
                />
                <div className="absolute right-3.5 top-3.5 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>验证通行证中...</span>
                </>
              ) : (
                <>
                  <span>进入管理后台</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              安全提示：本后台直接拥有 <code className="text-indigo-400">app</code> schema 全量读写权限，无 Supabase 用户登录包袱，请妥善保管访问密码与环境变量。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
