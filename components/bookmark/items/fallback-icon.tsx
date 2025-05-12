"use client";

import { useState } from "react";

interface FallbackIconProps {
  url: string;
  title: string;
  initialIconUrl?: string;
  defaultIcon?: string; // 现在是可选的
  className?: string;
  compact?: boolean;
}

/**
 * 简化版图标组件
 * 直接显示网站图标，不使用默认图标
 */
export function FallbackIcon({
  url,
  title,
  initialIconUrl,
  className = "",
  compact = false
}: FallbackIconProps) {
  // 使用多个状态来跟踪不同的图标源
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  // 从URL中提取域名
  function extractDomain(url: string): string {
    try {
      // 确保URL有协议
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      console.error("无法解析URL:", e);
      return url;
    }
  }

  // 生成多个图标URL
  const domain = extractDomain(url);
  const iconUrls = [
    initialIconUrl,
    `https://toicons.pages.dev/api/favicon?domain=${domain}&size=64`,
    `https://toicons.pages.dev/api/favicon?domain=${domain}&favicon&size=64`,
    `https://toicons.pages.dev/api/favicon?domain=${domain}&google&size=64`,
    `https://toicons.pages.dev/api/favicon?domain=${domain}&true&size=64`,
    `https://favicon.im/${domain}?larger=true`
  ].filter(Boolean) as string[]; // 过滤掉undefined和null

  // 处理图标加载错误
  const handleError = () => {
    // 尝试下一个图标URL
    if (currentIconIndex < iconUrls.length - 1) {
      setCurrentIconIndex(currentIconIndex + 1);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* 显示当前图标URL */}
      <img
        src={iconUrls[currentIconIndex]}
        alt={title}
        width={24}
        height={24}
        className={`object-contain ${compact ? 'w-5 h-5' : 'w-6 h-6'} ${className}`}
        onError={handleError}
        crossOrigin="anonymous"
      />
    </div>
  );
}
