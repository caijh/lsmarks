"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCollection } from "@/contexts/collection-context";
import { usePathname } from "next/navigation";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const { currentCollection } = useCollection();
  const pathname = usePathname();

  // 判断是否在集合详情页面
  const isCollectionPage = pathname?.includes('/collections/') && pathname?.split('/').length > 3;

  // 如果在集合详情页面且有当前集合，则显示集合名称，否则显示网站名称
  const siteName = isCollectionPage && currentCollection ? currentCollection.name : "LSMarks";

  // 根据尺寸设置样式 - 移动端优化
  const sizeClasses = {
    sm: "h-5 w-5 sm:h-6 sm:w-6",
    md: "h-6 w-6 sm:h-8 sm:w-8",
    lg: "h-8 w-8 sm:h-10 sm:w-10",
  };

  const textSizeClasses = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
  };

  // 确定链接目标：如果在集合页面，点击logo应该返回集合页面的顶部
  const linkHref = isCollectionPage && currentCollection ? pathname : "/";

  return (
    <Link
      href={linkHref}
      className={cn(
        "flex items-center gap-1 sm:gap-2 font-bold transition-opacity hover:opacity-80",
        className
      )}
    >
      {/* 在集合页面只显示文字，不显示图片 */}
      {(!isCollectionPage || !currentCollection) && (
        <div className={cn(sizeClasses[size])}>
          <img
            src="/logo.svg"
            alt="LSMarks Logo"
            className="w-full h-full"
          />
        </div>
      )}
      {(showText || (isCollectionPage && currentCollection)) && (
        <span
          className={cn(
            "font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 whitespace-nowrap",
            textSizeClasses[size],
            isCollectionPage && currentCollection ? "max-w-[250px] sm:max-w-[300px] truncate" : ""
          )}
          title={siteName}
        >
          {siteName}
        </span>
      )}
    </Link>
  );
}
