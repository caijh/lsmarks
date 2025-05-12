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
    // 首先使用提供的初始图标URL
    initialIconUrl,

    // 尝试使用不同的图标服务和参数
    // 使用较小的尺寸，避免413错误
    `https://toicons.pages.dev/api/favicon?domain=${domain}&size=32`,

    // 尝试使用favicon参数
    `https://toicons.pages.dev/api/favicon?domain=${domain}&favicon&size=32`,

    // 尝试使用google参数
    `https://toicons.pages.dev/api/favicon?domain=${domain}&google&size=32`,

    // 尝试使用true参数
    `https://toicons.pages.dev/api/favicon?domain=${domain}&true&size=32`,

    // 尝试使用favicon.im服务
    `https://favicon.im/${domain}`,

    // 尝试直接从网站获取favicon.ico
    `https://${domain}/favicon.ico`,

    // 尝试使用DuckDuckGo的图标服务
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,

    // 最后添加默认图标，当所有其他图标都失败时使用
    "/images/icon/default-icon.svg"
  ].filter(Boolean) as string[]; // 过滤掉undefined和null

  // 处理图标加载错误
  const handleError = () => {
    // 记录当前失败的图标URL
    console.debug(`图标加载失败: ${iconUrls[currentIconIndex]}`);

    // 尝试下一个图标URL
    if (currentIconIndex < iconUrls.length - 1) {
      setCurrentIconIndex(currentIconIndex + 1);
    } else {
      // 所有图标都失败了，确保使用默认图标
      console.debug('所有图标源都失败了，使用默认图标');
      // 这里不需要额外操作，因为默认图标已经是数组的最后一项
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
