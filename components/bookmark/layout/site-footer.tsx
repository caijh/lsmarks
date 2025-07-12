"use client";

// 导入图标
import { BookOpen } from "lucide-react";
// 国际化已移除

export function SiteFooter() {
  // 硬编码中文翻译
  const footer = {
    copyright: "© {year} LSMarks. 保留所有权利."
  };
  return (
    <footer className="border-t py-6 md:py-0 mt-auto glass-footer relative">
      {/* 底部栏装饰元素 - 增强版 */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/8 to-transparent -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent -z-10"></div>
      <div className="absolute inset-0 bg-gradient-primary-radial opacity-30 -z-10"></div>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">
            {footer.copyright.replace("{year}", new Date().getFullYear().toString())}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm">
            {/* 底部导航链接已被移除 */}

            <a
              href="https://github.com/lt-fcs/lsmarks"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="h-4 w-4">GitHub</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
