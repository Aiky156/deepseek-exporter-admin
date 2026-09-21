'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status Change Dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('refunded');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取订单失败');
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '状态更新失败');

      setActionSuccess(`订单 ${selectedOrder.out_trade_no} 状态已更新为 ${targetStatus}`);
      setSelectedOrder(null);
      fetchOrders();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '更新失败');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusConfig: Record<
    OrderStatus,
    { label: string; cls: string; icon: typeof CheckCircle2 }
  > = {
    paid: { label: '已支付', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
    pending: { label: '待支付', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
    refunded: { label: '已退款', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: RotateCcw },
    cancelled: { label: '已取消', cls: 'bg-slate-800 text-slate-400 border-slate-700', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-indigo-400" />
            <span>订单流水管理</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            查看用户付款记录、处理退款核销与账目核对（共 {totalCount} 笔记录）
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>刷新订单流水</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="搜索商户单号或第三方交易号..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
          <span className="text-xs text-slate-400 hidden sm:inline">状态:</span>
          {(['all', 'paid', 'pending', 'refunded', 'cancelled'] as const).map((st) => {
            const labels: Record<string, string> = {
              all: '全部',
              paid: '已支付',
              pending: '待支付',
              refunded: '已退款',
              cancelled: '已取消',
            };
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">单号 (商户 / 渠道)</th>
                <th className="py-3.5 px-4">下单用户</th>
                <th className="py-3.5 px-4">购买套餐</th>
                <th className="py-3.5 px-4">金额</th>
                <th className="py-3.5 px-4">支付渠道</th>
                <th className="py-3.5 px-4">状态</th>
                <th className="py-3.5 px-4">时间记录</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    <span>正在加载订单数据...</span>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const statusInfo = statusConfig[order.status] || {
                    label: order.status,
                    cls: 'bg-slate-800 text-slate-400',
                    icon: Clock,
                  };
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-200 font-semibold text-[11px] select-all">
                          {order.out_trade_no}
                        </div>
                        {order.trade_no && (
                          <div className="font-mono text-slate-500 text-[10px] select-all">
                            渠道号: {order.trade_no}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-500" />
                          <span>{order.user?.username || '未知用户'}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {order.user?.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            order.plan === 'permanent'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-blue-500/10 text-blue-300'
                          }`}
                        >
                          {order.plan === 'permanent' ? '永久会员' : order.plan === 'monthly' ? '月度会员' : order.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        ¥{order.amount}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          <span>
                            {order.payment_method === 'wechat'
                              ? '微信支付'
                              : order.payment_method === 'alipay'
                              ? '支付宝'
                              : '在线收银'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${statusInfo.cls}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <div>创建: {new Date(order.created_at).toLocaleString('zh-CN')}</div>
                        {order.paid_at && (
                          <div className="text-emerald-400/80">
                            支付: {new Date(order.paid_at).toLocaleString('zh-CN')}
                          </div>
                        )}
                        {order.refunded_at && (
                          <div className="text-purple-400/80">
                            退款: {new Date(order.refunded_at).toLocaleString('zh-CN')}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === 'paid' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setTargetStatus('refunded');
                              }}
                              className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>标记退款</span>
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setTargetStatus('paid');
                              }}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>补记支付</span>
                            </button>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'refunded' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setTargetStatus('cancelled');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] transition-colors cursor-pointer"
                            >
                              取消
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    暂无符合筛选条件的订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            第 <span className="text-slate-200 font-semibold">{page}</span> / {totalPages || 1} 页
            （共 {totalCount} 笔订单）
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

      {/* Confirmation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-400" />
              <span>确认修改订单状态</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              确定要将商户单号为 <code className="text-white font-mono">{selectedOrder.out_trade_no}</code> 
              （用户：{selectedOrder.user?.username}，金额：¥{selectedOrder.amount}）的状态更新为：
              <span className="font-bold text-indigo-400 ml-1">
                {statusConfig[targetStatus]?.label || targetStatus}
              </span> 吗？
            </p>

            {targetStatus === 'refunded' && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                标记为已退款后，系统将自动记录当前时间为 <code className="text-white">refunded_at</code>。
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>确认更新</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
