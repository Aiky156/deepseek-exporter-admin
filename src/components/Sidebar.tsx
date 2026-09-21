'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Megaphone, 
  Database,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const navigation = [
  { name: '数据概览', href: '/dashboard', icon: LayoutDashboard },
  { name: '用户与订阅', href: '/dashboard/users', icon: Users },
  { name: '订单流水', href: '/dashboard/orders', icon: Receipt },
  { name: '公告管理', href: '/dashboard/announcements', icon: Megaphone },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-600/30 ring-1 ring-white/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              DSE Admin
              <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
                上帝视角
              </span>
            </span>
            <span className="text-[11px] text-slate-400">ds.aikeyu.cn</span>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            主导航
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            快速通道
          </div>
          <a
            href="https://ds.aikeyu.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>访问主站前台</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              线上
            </span>
          </a>
        </div>

        {/* Footer Database Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">直连 Supabase (app)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            以 service_role 权限执行操作，所有修改即刻在主站生效。
          </p>
        </div>
      </aside>
    </>
  );
}
