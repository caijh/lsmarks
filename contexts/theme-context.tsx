"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ColorTheme, ThemeContextValue } from "@/types/bookmark/theme";

// 创建主题上下文
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// 本地存储键
const COLOR_THEME_KEY = "bookmark-color-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 状态
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("default");
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  // 从本地存储加载主题设置
  useEffect(() => {
    // 确保代码只在客户端执行
    if (typeof window === 'undefined') return;

    try {
      // 获取颜色主题
      const savedColorTheme = localStorage.getItem(COLOR_THEME_KEY) as ColorTheme | null;
      if (savedColorTheme && ["default", "blue", "green", "purple", "red"].includes(savedColorTheme)) {
        setColorThemeState(savedColorTheme);
      }
    } catch (error) {
      console.error("Error loading theme from localStorage:", error);
    }

    setMounted(true);
  }, []);

  // 应用主题设置
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    try {
      // 应用颜色主题
      document.documentElement.setAttribute("data-theme", colorTheme);

      // 应用自定义颜色（预留接口）
      if (customColors && Object.keys(customColors).length > 0) {
        Object.entries(customColors).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--${key}`, value);
        });
      }
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [colorTheme, customColors, mounted]);

  // 设置颜色主题
  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem(COLOR_THEME_KEY, theme);
  };

  // 上下文值
  const value: ThemeContextValue = {
    colorTheme,
    customColors,
    setColorTheme,
    setCustomColors,
  };

  // 在客户端渲染之前使用空的div，避免闪烁和水合不匹配
  if (!mounted) {
    // 返回一个空的Provider，而不是null，避免水合不匹配
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// 使用主题上下文的钩子
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
