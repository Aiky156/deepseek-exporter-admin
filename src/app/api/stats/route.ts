import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { DashboardStats, Order, UserWithSubscription } from '@/lib/types';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayStart = `${todayStr}T00:00:00.000Z`;

    // 1. Total users
    const { count: userCount, error: userErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (userErr) throw userErr;

    // 2. Today new users
    const { count: todayNewUsers, error: todayErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart);
    if (todayErr) throw todayErr;

    // 3. Plan breakdown
    const { data: subsData, error: subsErr } = await supabase
      .from('user_subscriptions')
      .select('plan');
    if (subsErr) throw subsErr;

    let monthlyCount = 0;
    let permanentCount = 0;
    (subsData || []).forEach((sub: { plan: string }) => {
      if (sub.plan === 'monthly') monthlyCount++;
      else if (sub.plan === 'permanent') permanentCount++;
    });
    const totalUsers = userCount || 0;
    const freeCount = Math.max(0, totalUsers - monthlyCount - permanentCount);

    // 4. Orders stats
    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select('id, amount, status');
    if (ordersErr) throw ordersErr;

    const totalOrders = ordersData?.length || 0;
    let paidOrders = 0;
    let totalRevenue = 0;
    (ordersData || []).forEach((o: { id: string; amount: number | string; status: string }) => {
      if (o.status === 'paid') {
        paidOrders++;
        totalRevenue += Number(o.amount || 0);
      }
    });

    // 5. Today exports count
    const { data: exportData, error: exportErr } = await supabase
      .from('export_limits')
      .select('count')
      .eq('export_date', todayStr);
    if (exportErr && exportErr.code !== 'PGRST116') {
      console.warn('Export limits query warning:', exportErr);
    }
    const todayExports = (exportData || []).reduce(
      (acc: number, row: { count: number }) => acc + (row.count || 0),
      0
    );

    // 6. Recent orders (top 6)
    const { data: recentOrdersRaw } = await supabase
      .from('orders')
      .select('*, user:users(username, email)')
      .order('created_at', { ascending: false })
      .limit(6);

    // 7. Recent users (top 6)
    const { data: recentUsersRaw } = await supabase
      .from('users')
      .select('*, subscription:user_subscriptions(*)')
      .order('created_at', { ascending: false })
      .limit(6);

    const stats: DashboardStats = {
      userCount: totalUsers,
      todayNewUsers: todayNewUsers || 0,
      freeUsersCount: freeCount,
      monthlyUsersCount: monthlyCount,
      permanentUsersCount: permanentCount,
      totalOrders,
      paidOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todayExports,
      recentOrders: (recentOrdersRaw || []) as Order[],
      recentUsers: (recentUsersRaw || []) as UserWithSubscription[],
    };

    return NextResponse.json(stats);
  } catch (err: unknown) {
    console.error('Stats API error:', err);
    const message = err instanceof Error ? err.message : '获取统计数据失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
