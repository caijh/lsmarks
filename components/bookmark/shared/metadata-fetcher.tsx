"use client";

import { useEffect } from "react";
import { generateIconUrl } from "@/utils/icon-url";

interface IconUrlGeneratorProps {
  url: string;
  onIconUrlGenerated: (iconUrl: string) => void;
}

export function IconUrlGenerator({ url, onIconUrlGenerated }: IconUrlGeneratorProps) {
  // 当URL变化且不为空时，生成谷歌图标URL
  useEffect(() => {
    if (url && url.trim() !== "") {
      // 使用工具函数生成图标URL
      const iconUrl = generateIconUrl(url);

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
      const icon_url = generateIconUrl(url);

      // 调用回调函数，传递元数据
      onMetadataFetched({
        title: url,
        icon_url
      });
    }
  }, [url, onMetadataFetched]);

  // 不渲染任何UI元素
  return null;
}
