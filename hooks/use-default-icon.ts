"use client";

import { useState, useEffect } from "react";

// 缓存默认图标路径
let cachedDefaultIcon: string | null = null;

export function useDefaultIcon() {
  const [defaultIcon, setDefaultIcon] = useState<string>("/images/icon/loading-bookmark-icon.svg");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function loadDefaultIcon() {
      try {
        // 如果已经有缓存，直接使用
        if (cachedDefaultIcon) {
          setDefaultIcon(cachedDefaultIcon);
          setIsLoading(false);
          return;
        }

        // 使用默认图标
        const defaultIconPath = "/images/icon/loading-bookmark-icon.svg";
        setDefaultIcon(defaultIconPath);
        cachedDefaultIcon = defaultIconPath;
        setIsLoading(false);
      } catch (error) {
        // 出错时使用默认值，但不显示错误
        console.debug("加载默认图标失败，使用内置默认图标");
        setIsLoading(false);
      }
    }

    loadDefaultIcon();
  }, []);

  return { defaultIcon, isLoading };
}
