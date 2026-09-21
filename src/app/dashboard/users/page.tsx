'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Clock
} from 'lucide-react';
import { UserWithSubscription, PlanType } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit Subscription Modal State
  const [editingUser, setEditingUser] = useState<UserWithSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');
  const [expiresDate, setExpiresDate] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search,
        plan: planFilter,
      });
      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取用户列表失败');
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenEdit = (user: UserWithSubscription) => {
    setEditingUser(user);
    const plan = user.subscription?.plan || 'free';
    setSelectedPlan(plan);
    if (user.subscription?.plan_expires_at) {
      setExpiresDate(user.subscription.plan_expires_at.slice(0, 10));
    } else {
      // default 30 days from now
      const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      setExpiresDate(d.toISOString().slice(0, 10));
    }
  };

  const handleSavePlan = async () => {
    if (!editingUser) return;
    setSavingPlan(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          plan: selectedPlan,
          planExpiresAt: selectedPlan === 'monthly' ? new Date(expiresDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '修改套餐失败');

      setActionSuccess(`已成功更新用户 ${editingUser.username} 的套餐为 ${selectedPlan}`);
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '保存出错');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeleteUser = async (user: UserWithSubscription) => {
    if (!confirm(`确定要删除用户 "${user.username}" 吗？\n注意：如果该用户有订单流水，数据库将阻止删除。`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users?userId=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '删除失败');
      setActionSuccess(`用户 ${user.username} 已被删除`);
      fetchUsers();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>用户与订阅管理</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            查询全站注册用户、调整会员身份与有效期（共 {totalCount} 名注册用户）
          </p>
        </div>

        <button
          onClick={() => fetchUsers()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>刷新用户表</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Plan Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
          <span className="text-xs text-slate-400 hidden sm:inline">筛选:</span>
          {(['all', 'free', 'monthly', 'permanent'] as const).map((plan) => {
            const labels: Record<string, string> = {
              all: '全部',
              free: '免费',
              monthly: '月卡',
              permanent: '永久',
            };
            const isActive = planFilter === plan;
            return (
              <button
                key={plan}
                onClick={() => {
                  setPlanFilter(plan);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {labels[plan]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">用户名 / 标识</th>
                <th className="py-3.5 px-4">邮箱</th>
                <th className="py-3.5 px-4">当前套餐</th>
                <th className="py-3.5 px-4">到期时间</th>
                <th className="py-3.5 px-4">注册时间</th>
                <th className="py-3.5 px-4">最后登录</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    <span>正在加载用户数据...</span>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const plan = user.subscription?.plan || 'free';
                  const expiresAt = user.subscription?.plan_expires_at;
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{user.username}</div>
                        <div className="text-[10px] text-slate-400 font-mono select-all">
                          {user.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            plan === 'permanent'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : plan === 'monthly'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {plan === 'permanent' ? '永久会员' : plan === 'monthly' ? '月度会员' : '免费用户'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {plan === 'permanent' ? (
                          <span className="text-amber-400/80">终身有效</span>
                        ) : expiresAt ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(expiresAt).toLocaleDateString('zh-CN')}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleString('zh-CN')
                          : <span className="text-slate-600">未记录</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            title="修改套餐"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>调套餐</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                            title="删除用户"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    未查找到匹配的用户数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            第 <span className="text-slate-200 font-semibold">{page}</span> / {totalPages || 1} 页
            （共 {totalCount} 条记录）
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>上一页</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>下一页</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>调整套餐权限</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div>
                用户：<span className="text-white font-semibold">{editingUser.username}</span>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">{editingUser.email}</div>
            </div>

            {/* Plan selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">目标套餐类型</label>
              <div className="grid grid-cols-3 gap-2">
                {(['free', 'monthly', 'permanent'] as const).map((p) => {
                  const names: Record<string, string> = {
                    free: '免费 Free',
                    monthly: '月卡 Monthly',
                    permanent: '永久 Permanent',
                  };
                  const isCur = selectedPlan === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPlan(p)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        isCur
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {names[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expiration date for monthly plan */}
            {selectedPlan === 'monthly' && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>到期时间 (截止至该日期结束)</span>
                </label>
                <input
                  type="date"
                  value={expiresDate}
                  onChange={(e) => setExpiresDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-2 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                      setExpiresDate(d.toISOString().slice(0, 10));
                    }}
                    className="px-2 py-1 bg-slate-800 rounded hover:text-white cursor-pointer"
                  >
                    +30天
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                      setExpiresDate(d.toISOString().slice(0, 10));
                    }}
                    className="px-2 py-1 bg-slate-800 rounded hover:text-white cursor-pointer"
                  >
                    +90天
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                      setExpiresDate(d.toISOString().slice(0, 10));
                    }}
                    className="px-2 py-1 bg-slate-800 rounded hover:text-white cursor-pointer"
                  >
                    +1年
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
              <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
              调整后将直接写入 <code className="text-white">app.user_subscriptions</code>，主站接口实时联动该状态。
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSavePlan}
                disabled={savingPlan}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingPlan && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>确认并立即生效</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
