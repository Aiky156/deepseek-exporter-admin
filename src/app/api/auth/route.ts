import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, SESSION_DURATION, createSessionToken, verifySessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      return NextResponse.json(
        { error: '服务端未配置 ADMIN_PASSWORD 环境变量' },
        { status: 500 }
      );
    }

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { error: '管理密码不正确' },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: Math.floor(SESSION_DURATION / 1000),
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authenticated = await verifySessionToken(token);
  return NextResponse.json({ authenticated });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
