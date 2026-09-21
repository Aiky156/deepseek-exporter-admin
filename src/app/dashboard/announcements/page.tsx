'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Megaphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  BellRing,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Announcement } from '@/lib/types';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('通告');
  const [isPopup, setIsPopup] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取公告列表失败');
      setAnnouncements(data.announcements || []);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId('');
    setTitle('');
    setContent('');
    setCategory('通告');
    setIsPopup(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category || '通告');
    setIsPopup(Boolean(item.is_popup));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('标题与正文不能为空');
      return;
    }

    setSaving(true);
    try {
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing
        ? { id: currentId, title, content, category, is_popup: isPopup }
        : { title, content, category, is_popup: isPopup };

      const res = await fetch('/api/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存公告失败');

      setActionSuccess(isEditing ? '公告已成功更新' : '新公告发布成功');
      setIsModalOpen(false);
      fetchAnnouncements();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, annTitle: string) => {
    if (!confirm(`确定要彻底删除公告 "${annTitle}" 吗？此操作无法撤回。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '删除失败');

      setActionSuccess('公告已删除');
      fetchAnnouncements();
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
            <Megaphone className="w-6 h-6 text-indigo-400" />
            <span>站内公告与通知</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            管理主站顶部滚动通告与用户进入时的强提醒弹窗
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAnnouncements()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">刷新</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>发布新公告</span>
          </button>
        </div>
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

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
            <span>正在加载公告内容...</span>
          </div>
        ) : announcements.length > 0 ? (
          announcements.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all shadow-md group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {item.category || '通告'}
                    </span>
                    {item.is_popup ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <BellRing className="w-3 h-3" />
                        <span>弹窗提示</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-normal bg-slate-800 text-slate-400">
                        普通展示
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>发布时间：{new Date(item.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs transition-colors cursor-pointer flex items-center gap-1"
                    title="编辑公告"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">编辑</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors cursor-pointer flex items-center gap-1"
                    title="删除公告"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">删除</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <p>暂无任何公告内容</p>
            <button
              onClick={openCreateModal}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              点击发布第一条公告 →
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-400" />
                <span>{isEditing ? '编辑公告内容' : '发布新站内公告'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  公告标题 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：系统维护通知 / 全新导出功能上线"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    分类标签
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="通告">通告</option>
                    <option value="新功能">新功能</option>
                    <option value="系统更新">系统更新</option>
                    <option value="停机维护">停机维护</option>
                    <option value="福利活动">福利活动</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    展示形式
                  </label>
                  <div className="flex items-center h-9">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200 select-none">
                      <input
                        type="checkbox"
                        checked={isPopup}
                        onChange={(e) => setIsPopup(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-950"
                      />
                      <span>用户进入时弹窗提醒 (is_popup)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  正文内容 *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="输入公告正文，支持换行和基本文字说明..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditing ? '确认保存' : '立即发布'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
