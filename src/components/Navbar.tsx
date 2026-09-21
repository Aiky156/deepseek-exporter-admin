'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, RefreshCw, Server } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Navbar({ onMenuClick, title, onRefresh, isRefreshing }: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirm('确定要退出管理面板吗？')) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch {
      alert('退出失败，请刷新重试');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
          aria-label="打开侧边菜单"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-base font-semibold text-slate-100 hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Environment indicator badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Server className="w-3.5 h-3.5" />
          <span>Vercel · Production Ready</span>
        </div>

        {/* Refresh button if provided */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs"
            title="刷新数据"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden md:inline">刷新</span>
          </button>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>退出</span>
        </button>
      </div>
    </header>
  );
}
