'use client';

import { useEffect } from 'react';
import { initIconInterceptor } from '@/utils/icon-interceptor';

/**
 * 图标拦截器提供者组件
 * 在应用启动时初始化图标拦截器
 */
export function IconInterceptorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化图标拦截器
    initIconInterceptor();

    // 不需要清理函数，因为MutationObserver会在页面卸载时自动清理
  }, []);

  return <>{children}</>;
}
