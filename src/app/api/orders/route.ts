import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { OrderStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || '';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*, user:users(username, email)', { count: 'exact' });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (search) {
      query = query.or(`out_trade_no.ilike.%${search}%,trade_no.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data: orders, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: unknown) {
    console.error('Orders GET error:', err);
    const message = err instanceof Error ? err.message : '获取订单失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { orderId, status } = body as { orderId: string; status: OrderStatus };

    if (!orderId || !status) {
      return NextResponse.json({ error: '缺少 orderId 或 status 参数' }, { status: 400 });
    }

    const validStatuses: OrderStatus[] = ['pending', 'paid', 'refunded', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '不合法的订单状态' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { status };
    const now = new Date().toISOString();

    if (status === 'refunded') {
      updates.refunded_at = now;
    } else if (status === 'paid') {
      updates.paid_at = now;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select('*, user:users(username, email)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order: data });
  } catch (err: unknown) {
    console.error('Orders PATCH error:', err);
    const message = err instanceof Error ? err.message : '更新订单状态失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
