"use client";

import { UserLevelEnum, getUserLevelInfo } from "@/types/user/level";
import { Badge } from "@/components/ui/badge";

interface UserLevelBadgeProps {
  level: UserLevelEnum;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export function UserLevelBadge({
  level,
  size = "md",
  showDescription = true,
}: UserLevelBadgeProps) {
  const levelInfo = getUserLevelInfo(level);

  // 根据大小设置样式
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-0.5",
    lg: "text-base px-2.5 py-1",
  };

  // 根据等级设置颜色
  const colorClass = levelInfo.color;

  return (
    <div className="flex items-center gap-1.5">
      <Badge
        variant="outline"
        className={`font-medium ${sizeClasses[size]} border-current ${colorClass} hover:${colorClass}/80 transition-all duration-200 shadow-sm hover:shadow`}
      >
        <span className="relative">
          {levelInfo.name}
          <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-current opacity-30 rounded-full"></span>
        </span>
      </Badge>

      {showDescription && (
        <span className="text-xs text-muted-foreground">
          {levelInfo.description}
        </span>
      )}
    </div>
  );
}
