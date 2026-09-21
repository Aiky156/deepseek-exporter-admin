import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { PlanType, UserWithSubscription } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const planFilter = searchParams.get('plan')?.trim() || '';

    const offset = (page - 1) * limit;

    // Base query
    let query = supabase
      .from('users')
      .select('*, subscription:user_subscriptions(*)', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Ordering
    query = query.order('created_at', { ascending: false });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;
    if (error) throw error;

    let filteredUsers = users || [];

    // Filter by plan client-side if planFilter specified and not 'all'
    if (planFilter && planFilter !== 'all') {
      filteredUsers = (filteredUsers as UserWithSubscription[]).filter(
        (u: UserWithSubscription) => {
          const p = u.subscription?.plan || 'free';
          return p === planFilter;
        }
      );
    }

    return NextResponse.json({
      users: filteredUsers,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: unknown) {
    console.error('Users GET error:', err);
    const message = err instanceof Error ? err.message : '获取用户列表失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Update user subscription / plan
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { userId, plan, planExpiresAt } = body as {
      userId: string;
      plan: PlanType;
      planExpiresAt?: string | null;
    };

    if (!userId || !plan) {
      return NextResponse.json(
        { error: '缺少必要的 userId 或 plan 参数' },
        { status: 400 }
      );
    }

    const validPlans: PlanType[] = ['free', 'monthly', 'permanent'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: '不合法的套餐类型，仅支持 free, monthly, permanent' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const expiresAt =
      plan === 'monthly'
        ? planExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    // Upsert into app.user_subscriptions
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: userId,
          plan,
          plan_expires_at: expiresAt,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      subscription: data,
    });
  } catch (err: unknown) {
    console.error('Users PATCH error:', err);
    const message = err instanceof Error ? err.message : '更新用户套餐失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Delete user (Restricted if user has orders)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少 userId 参数' }, { status: 400 });
    }

    // Check if user has orders
    const { count: orderCount, error: orderErr } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (orderErr) throw orderErr;
    if (orderCount && orderCount > 0) {
      return NextResponse.json(
        {
          error: `该用户关联有 ${orderCount} 笔支付订单，出于审计防孤儿保护（ON DELETE RESTRICT），不允许直接删除。如需封禁，可将其套餐降级为 free。`,
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Users DELETE error:', err);
    const message = err instanceof Error ? err.message : '删除用户失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
