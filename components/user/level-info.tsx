"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserLevelInfo, UserLevelLimits } from "@/types/user-level";
// 国际化已移除
import { AlertCircle, CheckCircle2, Crown, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";

interface UserLevelInfoProps {
  subcategoryUuid?: string;
  onUpgrade?: () => void;
  className?: string;
}

export function UserLevelInfoCard({ subcategoryUuid, onUpgrade, className }: UserLevelInfoProps) {
  // 硬编码中文翻译
  const t = (key: string) => {
    // 为常用键提供默认值
    if (key === "user_level.title") return "用户等级";
    if (key === "user_level.current_level") return "当前等级";
    if (key === "user_level.upgrade") return "升级";
    if (key === "user_level.max_collections") return "最大集合数";
    if (key === "user_level.max_categories") return "最大分类数";
    if (key === "user_level.max_subcategories") return "最大子分类数";
    if (key === "user_level.max_bookmarks") return "最大书签数";
    return key;
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelInfo, setLevelInfo] = useState<{
    level: UserLevelInfo;
    limits: UserLevelLimits;
  } | null>(null);

  useEffect(() => {
    const fetchLevelInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = '/api/user/level';
        if (subcategoryUuid) {
          url += `?subcategory_uuid=${subcategoryUuid}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch user level info');
        }

        const data = await response.json();

        if (data.code !== 0) {
          throw new Error(data.message || 'Unknown error');
        }

        setLevelInfo(data.data);
      } catch (err) {
        console.error('Error fetching user level info:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLevelInfo();
  }, [subcategoryUuid]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>加载中...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !levelInfo) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>获取用户等级信息失败</CardTitle>
          <CardDescription>{error || '未知错误'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { level, limits } = levelInfo;

  // 计算集合使用百分比
  const collectionsPercentage = Math.min(
    Math.round((limits.collectionsUsed / limits.collectionsLimit) * 100),
    100
  );

  // 获取等级图标
  const getLevelIcon = (levelCode: string) => {
    switch (levelCode) {
      case 'free':
        return null;
      case 'basic':
        return <Star className="h-4 w-4 text-yellow-400" />;
      case 'premium':
        return <Star className="h-4 w-4 text-purple-400" />;
      case 'pro':
        return <Crown className="h-4 w-4 text-amber-400" />;
      default:
        return null;
    }
  };

  // 获取等级颜色
  const getLevelColor = (levelCode: string) => {
    switch (levelCode) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'pro':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>用户等级</CardTitle>
          <Badge className={getLevelColor(level.level_code)} variant="outline">
            <span className="flex items-center gap-1">
              {getLevelIcon(level.level_code)}
              {level.level_name}
            </span>
          </Badge>
        </div>
        <CardDescription>{level.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 书签集合限制 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">书签集合</span>
              <span className="text-sm text-muted-foreground">
                {limits.collectionsUsed} / {limits.collectionsLimit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary flex-1">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${collectionsPercentage}%` }}
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {limits.canCreateCollection ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {limits.canCreateCollection
                      ? '您可以创建新的书签集合'
                      : '您已达到书签集合数量限制'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* 每个集合的书签限制 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">每个集合的书签数量限制</span>
              <span className="text-sm text-muted-foreground">
                {limits.bookmarksLimit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {limits.canCreateBookmark ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {limits.canCreateBookmark
                      ? '您可以在此集合中添加新的书签'
                      : '您已达到此集合的书签数量限制'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* 升级按钮 */}
          {level.level_code !== 'pro' && onUpgrade && (
            <Button onClick={onUpgrade} className="w-full mt-4">
              升级账户
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
