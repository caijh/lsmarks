"use client";

import { useTheme } from "@/contexts/theme-context";
import { ColorTheme } from "@/types/bookmark/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Sun, Droplet, Leaf, Cloud, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

// 获取主题对应的颜色和图标
function getThemeColor(theme: ColorTheme): string {
  switch (theme) {
    case "default":
      return "#f59e0b"; // 晨曦 - 温暖的橙黄色
    case "blue":
      return "#3b82f6"; // 碧海 - 深蓝色
    case "green":
      return "#10b981"; // 翠竹 - 翠绿色
    case "purple":
      return "#8b5cf6"; // 紫霞 - 紫色
    case "red":
      return "#ef4444"; // 朱砂 - 红色
    default:
      return "#f59e0b";
  }
}

// 获取主题对应的图标
function getThemeIcon(theme: ColorTheme) {
  switch (theme) {
    case "default":
      return <Sun className="h-3.5 w-3.5" />; // 晨曦 - 太阳图标
    case "blue":
      return <Droplet className="h-3.5 w-3.5" />; // 碧海 - 水滴图标
    case "green":
      return <Leaf className="h-3.5 w-3.5" />; // 翠竹 - 叶子图标
    case "purple":
      return <Cloud className="h-3.5 w-3.5" />; // 紫霞 - 云朵图标
    case "red":
      return <Flame className="h-3.5 w-3.5" />; // 朱砂 - 火焰图标
    default:
      return <Sun className="h-3.5 w-3.5" />;
  }
}

export function ThemeSwitcher() {
  const { colorTheme, setColorTheme } = useTheme();

  // 颜色主题选项
  const colorThemes: { value: ColorTheme; label: string }[] = [
    { value: "default", label: "晨曦" },
    { value: "blue", label: "碧海" },
    { value: "green", label: "翠竹" },
    { value: "purple", label: "紫霞" },
    { value: "red", label: "朱砂" },
  ];

  return (
    <div className="flex items-center gap-1">
      {/* 颜色主题切换 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="选择颜色主题"
            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full hover:bg-background/60 p-1 sm:p-2"
          >
            <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 glass-popover">
          {colorThemes.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => setColorTheme(theme.value)}
              className={cn(
                "flex items-center gap-2 cursor-pointer transition-all duration-200",
                colorTheme === theme.value ? "bg-accent/50" : "hover:bg-accent/20"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 flex items-center justify-center rounded-full shadow-sm transition-all duration-200"
                  style={{
                    color: "white",
                    backgroundColor: getThemeColor(theme.value),
                    border: "1px solid hsl(var(--border))",
                    transform: colorTheme === theme.value ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {getThemeIcon(theme.value)}
                </div>
                <span className="font-medium">{theme.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
