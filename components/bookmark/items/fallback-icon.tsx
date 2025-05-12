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

// 检查URL是否是Google图标URL
function isGoogleIconUrl(url: string): boolean {
  if (!url) return false;

  return (
    url.includes('google.com/s2/favicons') ||
    url.includes('gstatic.com/faviconV2') ||
    url.includes('www.google.com')
  );
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
  const [currentIconUrl, setCurrentIconUrl] = useState<string>("");
  const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isDefaultIcon, setIsDefaultIcon] = useState<boolean>(false);

  // 初始化备选URL列表和初始图标
  useEffect(() => {
    // 重置状态
    setIsLoading(true);
    setHasError(false);
    setIsDefaultIcon(false);

    if (url) {
      // 使用64像素大小的图标
      const urls = generateFallbackIconUrls(url, 64);

      // 过滤掉可能导致CORS错误的URL
      const filteredUrls = urls.filter(url => !isGoogleIconUrl(url));

      setFallbackUrls(filteredUrls);

      // 处理初始图标URL
      if (initialIconUrl) {
        // 检查初始图标URL是否是Google图标URL
        if (isGoogleIconUrl(initialIconUrl) && filteredUrls.length > 0) {
          // 如果是Google图标URL，使用第一个备选URL
          setCurrentIconUrl(filteredUrls[0]);
          setFallbackIndex(1);
        } else {
          // 否则使用初始图标URL
          setCurrentIconUrl(initialIconUrl);
          // 从备选列表中找到它的位置
          const index = filteredUrls.indexOf(initialIconUrl);
          setFallbackIndex(index >= 0 ? index + 1 : 0);
        }
      } else if (filteredUrls.length > 0) {
        // 如果没有提供初始图标URL，使用第一个备选URL
        setCurrentIconUrl(filteredUrls[0]);
        setFallbackIndex(1);
      } else {
        // 如果没有备选URL，使用默认图标
        setCurrentIconUrl(defaultIcon);
        setIsDefaultIcon(true);
        setIsLoading(false);
      }
    } else {
      // 如果没有URL，使用默认图标
      setCurrentIconUrl(defaultIcon);
      setIsDefaultIcon(true);
      setIsLoading(false);
    }
  }, [url, initialIconUrl, defaultIcon]);

  // 处理图标加载错误
  const handleError = () => {
    // 记录错误
    console.debug(`图标加载失败: ${currentIconUrl}`);

    // 设置错误状态
    setHasError(true);
    setIsLoading(false);

    // 检查当前URL是否是直接的favicon.ico
    const isFaviconIco = currentIconUrl.includes('/favicon.ico');

    // 检查是否是Google的图标服务
    const isGoogleService = isGoogleIconUrl(currentIconUrl);

    // 如果是Google的图标服务，直接跳过，不要尝试
    if (isGoogleService) {
      console.debug('跳过Google图标服务，避免CORS错误');
      tryNextFallback(0);
      return;
    }

    // 尝试加载下一个备选图标
    if (fallbackIndex < fallbackUrls.length) {
      // 添加延迟，避免快速连续请求
      // 如果是favicon.ico失败，增加延迟时间，因为这通常意味着网站可能没有图标
      const delayTime = isFaviconIco ? 300 : 100;
      tryNextFallback(delayTime);
    } else {
      // 所有备选都失败，使用默认图标
      console.debug('所有备选图标都失败，使用默认图标');
      setCurrentIconUrl(defaultIcon);
      setIsDefaultIcon(true);
      setIsLoading(false);
      setHasError(false);
    }
  };

  // 尝试加载下一个备选图标
  const tryNextFallback = (delayTime: number) => {
    if (fallbackIndex < fallbackUrls.length) {
      setTimeout(() => {
        const nextUrl = fallbackUrls[fallbackIndex];
        console.debug(`尝试加载下一个备选图标: ${nextUrl}`);
        setCurrentIconUrl(nextUrl);
        setFallbackIndex(fallbackIndex + 1);
        setHasError(false);
        setIsLoading(true);
        setIsDefaultIcon(false);
      }, delayTime);
    } else {
      // 所有备选都失败，使用默认图标
      console.debug('没有更多备选图标，使用默认图标');
      setCurrentIconUrl(defaultIcon);
      setIsDefaultIcon(true);
      setIsLoading(false);
      setHasError(false);
    }
  };

  // 处理图标加载成功
  const handleLoad = () => {
    console.debug(`图标加载成功: ${currentIconUrl}`);
    setIsLoading(false);
    setHasError(false);
  };

  // 调试输出
  useEffect(() => {
    console.debug(`FallbackIcon state: isLoading=${isLoading}, hasError=${hasError}, currentIconUrl=${currentIconUrl}, isDefaultIcon=${isDefaultIcon}`);
  }, [isLoading, hasError, currentIconUrl, isDefaultIcon]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 使用条件渲染确保只显示一个图标 */}
        {isDefaultIcon || !currentIconUrl || isLoading || hasError ? (
          // 显示默认图标
          <img
            src={defaultIcon}
            alt={title}
            width={24}
            height={24}
            className={`object-contain ${compact ? 'w-5 h-5' : 'w-6 h-6'} ${className}`}
          />
        ) : (
          // 显示网站图标
          <img
            key={currentIconUrl}
            src={currentIconUrl}
            alt={title}
            width={24}
            height={24}
            className={`object-contain ${compact ? 'w-5 h-5' : 'w-6 h-6'} ${className}`}
            onError={handleError}
            onLoad={handleLoad}
            crossOrigin="anonymous"
          />
        )}
      </div>
    </div>
  );
}
