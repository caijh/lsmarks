"use client";

import { useEffect } from "react";
import { generateIconUrl, generateFallbackIconUrls } from "@/utils/icon-url";

interface IconUrlGeneratorProps {
  url: string;
  onIconUrlGenerated: (iconUrl: string) => void;
}

export function IconUrlGenerator({ url, onIconUrlGenerated }: IconUrlGeneratorProps) {
  // 当URL变化且不为空时，生成图标URL
  useEffect(() => {
    if (url && url.trim() !== "") {
      // 使用工具函数生成图标URL
      // 使用toicons.pages.dev服务，避免CORS错误
      const iconUrl = generateIconUrl(url, 64);

      // 回调函数返回图标URL
      onIconUrlGenerated(iconUrl);
    }
  }, [url, onIconUrlGenerated]);

  // 不渲染任何UI元素
  return null;
}

// 为了兼容性，保留MetadataFetcher组件但简化实现
interface MetadataFetcherProps {
  url: string;
  onMetadataFetched: (metadata: { title?: string; icon_url?: string }) => void;
}

export function MetadataFetcher({ url, onMetadataFetched }: MetadataFetcherProps) {
  useEffect(() => {
    if (url && url.trim() !== "") {
      // 生成图标URL
      // 使用toicons.pages.dev服务，避免CORS错误
      const icon_url = generateIconUrl(url, 64);

      // 尝试提取标题
      let title = url;
      try {
        // 从URL中提取域名作为标题的一部分
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        title = domain.replace(/^www\./, ''); // 移除www前缀
      } catch (e) {
        // 如果URL解析失败，使用原始URL作为标题
        console.debug("无法解析URL:", e);
      }

      // 调用回调函数，传递元数据
      onMetadataFetched({
        title: title,
        icon_url
      });
    }
  }, [url, onMetadataFetched]);

  // 不渲染任何UI元素
  return null;
}
