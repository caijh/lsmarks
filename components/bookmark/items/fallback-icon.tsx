"use client";

import { useState, useEffect } from "react";
import { generateFallbackIconUrls } from "@/utils/icon-url";

interface FallbackIconProps {
  url: string;
  title: string;
  initialIconUrl?: string;
  defaultIcon: string;
  className?: string;
  compact?: boolean;
}

/**
 * 带有备选方案的图标组件
 * 当主图标加载失败时，会尝试加载备选图标
 */
export function FallbackIcon({
  url,
  title,
  initialIconUrl,
  defaultIcon,
  className = "",
  compact = false
}: FallbackIconProps) {
  const [currentIconUrl, setCurrentIconUrl] = useState<string>(initialIconUrl || "");
  const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // 初始化备选URL列表
  useEffect(() => {
    if (url) {
      const urls = generateFallbackIconUrls(url);
      setFallbackUrls(urls);

      // 如果没有提供初始图标URL，使用第一个备选URL
      if (!initialIconUrl && urls.length > 0) {
        setCurrentIconUrl(urls[0]);
        setFallbackIndex(1); // 下一个备选索引
      } else if (initialIconUrl) {
        // 如果提供了初始图标URL，从备选列表中找到它的位置
        const index = urls.indexOf(initialIconUrl);
        setFallbackIndex(index >= 0 ? index + 1 : 0);
      }
    }
  }, [url, initialIconUrl]);

  // 处理图标加载错误
  const handleError = () => {
    // 记录错误
    console.debug(`图标加载失败: ${currentIconUrl}`);
    setHasError(true);

    // 尝试加载下一个备选图标
    if (fallbackIndex < fallbackUrls.length) {
      // 添加延迟，避免快速连续请求
      setTimeout(() => {
        setCurrentIconUrl(fallbackUrls[fallbackIndex]);
        setFallbackIndex(fallbackIndex + 1);
        setHasError(false);
      }, 100);
    } else {
      // 所有备选都失败，使用默认图标
      setCurrentIconUrl(defaultIcon);
    }
  };

  // 处理图标加载成功
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 当前图标 */}
      {currentIconUrl && (
        <img
          src={currentIconUrl}
          alt={title}
          width={24}
          height={24}
          className={`object-contain ${compact ? 'w-5 h-5' : 'w-6 h-6'} ${className} ${hasError ? 'hidden' : ''}`}
          onError={handleError}
          onLoad={handleLoad}
          // 添加crossOrigin属性，避免跨域问题
          crossOrigin="anonymous"
        />
      )}

      {/* 加载中或所有图标都失败时显示默认图标 */}
      {(isLoading || hasError) && (
        <img
          src={defaultIcon}
          alt={title}
          width={24}
          height={24}
          className={`object-contain ${compact ? 'w-5 h-5' : 'w-6 h-6'} ${className}`}
        />
      )}
    </div>
  );
}
