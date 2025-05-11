import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 这个中间件会拦截所有请求
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 如果请求路径是 /zh，重定向到根路径
  if (pathname === '/zh') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 处理其他请求
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有路径
    '/(.*)',
  ],
};
