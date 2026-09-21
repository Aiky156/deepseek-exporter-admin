'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Crown, 
  DollarSign, 
  DownloadCloud, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取统计失败');
      setStats(data);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const paidRatio = stats && stats.totalOrders > 0
    ? Math.round((stats.paidOrders / stats.totalOrders) * 100)
    : 0;

  const totalMembers = (stats?.monthlyUsersCount || 0) + (stats?.permanentUsersCount || 0);
  const memberRatio = stats && stats.userCount > 0
    ? Math.round((totalMembers / stats.userCount) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>总览看板</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-normal">
              实时数据
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            监控用户规模、会员付费转化与导出用量
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{refreshing ? '正在同步...' : '刷新数据'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <p className="font-medium">数据加载异常</p>
            <p className="text-xs text-rose-400/90 mt-0.5">{error}</p>
            <p className="text-xs text-slate-400 mt-1">
              请检查 Vercel 环境变量 SUPABASE_URL 与 SUPABASE_SECRET_KEY 是否配置正确。
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-5 shadow-lg group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">用户总数</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-white">
              {loading ? '--' : stats?.userCount.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400 gap-1.5">
              <span className="text-emerald-400 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{stats?.todayNewUsers ?? 0}
              </span>
              <span>今日新增注册</span>
            </div>
          </div>
        </div>

        {/* Card 2: Members */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-5 shadow-lg group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">付费会员数</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-white">
              {loading ? '--' : totalMembers}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400 gap-2">
              <span className="text-amber-400 font-semibold">
                转化率 {memberRatio}%
              </span>
              <span>· 永久 {stats?.permanentUsersCount ?? 0} | 月卡 {stats?.monthlyUsersCount ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-5 shadow-lg group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">订单总流水</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-white">
              ¥{loading ? '--' : (stats?.totalRevenue ?? 0).toLocaleString()}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400 gap-2">
              <span className="text-emerald-400 font-semibold">
                {stats?.paidOrders ?? 0} 笔支付
              </span>
              <span>(共 {stats?.totalOrders ?? 0} 单, {paidRatio}% 付款率)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Exports */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-5 shadow-lg group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">今日导出频次</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <DownloadCloud className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-white">
              {loading ? '--' : stats?.todayExports.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400 gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>今日免费用户累计限流记录</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan distribution card */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>套餐结构占比</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">全站用户的套餐分布</p>

            <div className="mt-6 space-y-4">
              {/* Permanent */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">永久会员 (Permanent)</span>
                  <span className="text-amber-400 font-semibold">{stats?.permanentUsersCount ?? 0} 人</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all"
                    style={{
                      width: `${stats && stats.userCount > 0 ? ((stats.permanentUsersCount || 0) / stats.userCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Monthly */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">月度会员 (Monthly)</span>
                  <span className="text-blue-400 font-semibold">{stats?.monthlyUsersCount ?? 0} 人</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all"
                    style={{
                      width: `${stats && stats.userCount > 0 ? ((stats.monthlyUsersCount || 0) / stats.userCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Free */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">免费用户 (Free)</span>
                  <span className="text-slate-400 font-semibold">{stats?.freeUsersCount ?? 0} 人</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-600 h-full rounded-full transition-all"
                    style={{
                      width: `${stats && stats.userCount > 0 ? ((stats.freeUsersCount || 0) / stats.userCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">需要调整用户套餐？</span>
            <Link
              href="/dashboard/users"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>前往用户管理</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>最新注册用户</span>
              </h3>
              <Link
                href="/dashboard/users"
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                查看全部
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-1">最近加入 ds.aikeyu.cn 的用户</p>

            <div className="mt-4 divide-y divide-slate-800/60">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">加载中...</div>
              ) : stats?.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user) => {
                  const plan = user.subscription?.plan || 'free';
                  return (
                    <div key={user.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-slate-200 truncate">{user.username}</div>
                        <div className="text-slate-400 truncate text-[11px]">{user.email}</div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            plan === 'permanent'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : plan === 'monthly'
                              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {plan === 'permanent' ? '永久' : plan === 'monthly' ? '月卡' : '免费'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">暂无用户记录</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Database Shortcuts */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/30 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>便捷数据库维护</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">常用上帝视角控制功能</p>

            <div className="mt-4 space-y-2.5">
              <Link
                href="/dashboard/users"
                className="block p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all text-xs"
              >
                <div className="font-medium text-slate-200 flex items-center justify-between">
                  <span>用户套餐升降级</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  直接将指定用户升级为永久/月卡会员，主站立即生效
                </div>
              </Link>

              <Link
                href="/dashboard/orders"
                className="block p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all text-xs"
              >
                <div className="font-medium text-slate-200 flex items-center justify-between">
                  <span>订单退款标记</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  将用户订单修改为 refunded 状态，并记录退款时间
                </div>
              </Link>

              <Link
                href="/dashboard/announcements"
                className="block p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all text-xs"
              >
                <div className="font-medium text-slate-200 flex items-center justify-between">
                  <span>发布首页公告 / 弹窗</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  主站顶栏与弹窗通知一键发布、编辑与下线
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">最新订单流水</h3>
            <p className="text-xs text-slate-400 mt-0.5">显示最近产生的支付与充值交易</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>完整流水</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">商户单号</th>
                <th className="py-3 px-3">用户</th>
                <th className="py-3 px-3">购买套餐</th>
                <th className="py-3 px-3">金额</th>
                <th className="py-3 px-3">状态</th>
                <th className="py-3 px-3">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    加载中...
                  </td>
                </tr>
              ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => {
                  const statusMap: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
                    paid: { label: '已支付', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
                    pending: { label: '待支付', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
                    refunded: { label: '已退款', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: RefreshCw },
                    cancelled: { label: '已取消', cls: 'bg-slate-800 text-slate-400 border-slate-700', icon: AlertCircle },
                  };
                  const statusInfo = statusMap[order.status] || { label: order.status, cls: 'bg-slate-800 text-slate-400', icon: Clock };
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {order.out_trade_no}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-200">
                          {order.user?.username || '未知用户'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="capitalize">
                          {order.plan === 'permanent' ? '永久卡' : order.plan === 'monthly' ? '月卡' : order.plan}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        ¥{order.amount}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${statusInfo.cls}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {new Date(order.created_at).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    暂无订单记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
