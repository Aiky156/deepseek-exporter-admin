import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Announcement } from '@/lib/types';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ announcements: (data || []) as Announcement[] });
  } catch (err: unknown) {
    console.error('Announcements GET error:', err);
    const message = err instanceof Error ? err.message : '获取公告失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { title, content, category = '通告', is_popup = false } = body;

    if (!title || !content) {
      return NextResponse.json({ error: '标题和内容为必填项' }, { status: 400 });
    }

    const newRow = {
      id: crypto.randomUUID(),
      title,
      content,
      category,
      is_popup: Boolean(is_popup),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('announcements')
      .insert(newRow)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, announcement: data });
  } catch (err: unknown) {
    console.error('Announcements POST error:', err);
    const message = err instanceof Error ? err.message : '创建公告失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { id, title, content, category, is_popup } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少 id 参数' }, { status: 400 });
    }

    const updates: Partial<Announcement> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (is_popup !== undefined) updates.is_popup = is_popup;

    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, announcement: data });
  } catch (err: unknown) {
    console.error('Announcements PATCH error:', err);
    const message = err instanceof Error ? err.message : '修改公告失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少 id 参数' }, { status: 400 });
    }

    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Announcements DELETE error:', err);
    const message = err instanceof Error ? err.message : '删除公告失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
