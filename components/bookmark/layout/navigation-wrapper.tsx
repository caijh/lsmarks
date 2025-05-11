"use client";

import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

interface NavigationWrapperProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    uuid?: string | null;
    username?: string | null;
  } | null;
}

export function NavigationWrapper({ user, children }: NavigationWrapperProps & { children?: React.ReactNode }) {
  return (
    <>
      {/* 全屏背景 - 增强版 */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 -z-20"></div>

      {/* 主题相关渐变背景 */}
      <div className="fixed inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent -z-20"></div>
      <div className="fixed inset-0 bg-gradient-to-l from-primary/5 via-transparent to-transparent -z-20"></div>
      <div className="fixed inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent -z-20"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-20"></div>

      {/* 装饰性背景 - 简化版 */}

      <div className="flex flex-col min-h-screen relative">
        <SiteHeader user={user} />
        <div className="flex-grow transition-all-smooth">
          {children}
        </div>
        <SiteFooter />
      </div>
    </>
  );
}
