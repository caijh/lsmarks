import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 这个中间件会拦截所有请求
export function middleware(request: NextRequest) {
  // 简单的中间件，只处理基本请求
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有路径
    '/(.*)',
  ],
};
