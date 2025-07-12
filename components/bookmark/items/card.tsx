"use client";

import { BookmarkItem } from "@/types/bookmark/item";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink, Bookmark, Flame, MoreVertical, Globe, Link2 } from "@/components/ui/icons";
import Image from "next/image";
import { PermissionGuard } from "../shared/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FallbackIcon } from "@/components/bookmark/items/fallback-icon";
import { useLongPress, useIsTouchDevice } from "@/hooks/use-mobile-gestures";
import { useState } from "react";

interface BookmarkItemCardProps {
  item: BookmarkItem;
  isOwner?: boolean;
  editMode?: boolean;
  onEdit?: (item: BookmarkItem) => void;
  onDelete?: (item: BookmarkItem) => void;
  isReadOnly?: boolean; // 是否为只读模式（用于排序视图）
  className?: string; // 自定义类名
  compact?: boolean; // 紧凑模式，用于在"全部"视图中显示
}

export function BookmarkItemCard({
  item,
  isOwner = false,
  editMode = false,
  onEdit,
  onDelete,
  isReadOnly = false, // 默认非只读
  className = '', // 默认无自定义类名
  compact = false, // 默认非紧凑模式
}: BookmarkItemCardProps) {
  // 硬编码为中文
  const locale = 'zh';
  const { title, url, description, icon_url, add_count } = item;

  // 移动端手势支持
  const isTouchDevice = useIsTouchDevice();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 长按手势处理
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (isTouchDevice && isOwner && editMode && !isReadOnly) {
        setShowMobileMenu(true);
      }
    },
    delay: 600,
    threshold: 15
  });

  // 提取域名用于显示
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  };

  const domain = getDomain(url);

  return (
    <Card
      className={`overflow-hidden h-full flex flex-col relative group bg-card/80 backdrop-blur-md border border-border/50
        ${!isReadOnly ? 'hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/30 hover:bg-card/90' : ''}
        ${compact ? 'p-0 border-border/40 hover:border-primary/40' : ''}
        ${longPressHandlers.isLongPressing ? 'ring-2 ring-primary/50 shadow-lg scale-[1.02]' : ''}
        ${className}`}
      {...(isTouchDevice && isOwner && editMode && !isReadOnly ? longPressHandlers : {})}
    >
      {/* 右上角的操作菜单 - 只在非只读模式下显示 */}
      {!isReadOnly && (
        <PermissionGuard isAllowed={isOwner && editMode}>
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-20 pointer-events-auto">
            <DropdownMenu open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full hover:bg-background/80 backdrop-blur-sm ${isTouchDevice ? 'sm:block hidden' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="sr-only">{locale === 'zh' ? '打开菜单' : 'Open menu'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowMobileMenu(false);
                    onEdit?.(item);
                  }}
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  {locale === 'zh' ? '编辑书签' : 'Edit'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowMobileMenu(false);
                    onDelete?.(item);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  {locale === 'zh' ? '删除书签' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PermissionGuard>
      )}

      {/* 移动端长按提示 */}
      {isTouchDevice && isOwner && editMode && !isReadOnly && longPressHandlers.isLongPressing && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-30 rounded-md">
          <div className="bg-background/90 px-3 py-2 rounded-md shadow-lg border">
            <p className="text-xs text-muted-foreground">松开显示菜单</p>
          </div>
        </div>
      )}

      {/* 使整个卡片可点击 - 只在非只读模式下添加链接 */}
      {!isReadOnly && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          aria-label={locale === 'zh' ? `访问 ${title}` : `Visit ${title}`}
        >
          <span className="sr-only">{locale === 'zh' ? `访问 ${title}` : `Visit ${title}`}</span>
        </a>
      )}

      <CardContent className={`flex-grow ${compact ? 'p-2 sm:p-3' : 'p-2.5 sm:p-3'} z-10 relative pointer-events-none`}>
        <div className="flex items-start gap-1.5 sm:gap-2">
          <div className={`flex-shrink-0 ${compact ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-8 sm:h-8'} relative bg-background rounded-md p-0.5 sm:p-1 border flex items-center justify-center pointer-events-auto`}>
            {/* 使用改进后的FallbackIcon组件 */}
            <FallbackIcon
              url={url}
              title={title}
              initialIconUrl={icon_url}
              compact={compact}
            />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className={`${compact ? 'text-xs sm:text-sm' : 'text-sm'} font-medium truncate pointer-events-auto leading-tight`}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {title}
              </a>
            </h3>
            <div className="flex items-center flex-wrap gap-0.5 sm:gap-1 mt-0.5">
              <span className={`${compact ? 'text-[10px] sm:text-xs' : 'text-xs'} text-muted-foreground truncate pointer-events-auto max-w-[120px] sm:max-w-none`}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {domain}
                </a>
              </span>
              {!compact && add_count && add_count > 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-0.5 sm:gap-1 h-4 sm:h-5 text-[9px] sm:text-xs pointer-events-auto px-1 sm:px-1.5">
                        <Bookmark className="h-2 w-2 sm:h-3 sm:w-3" />
                        <span className="hidden xs:inline">{add_count}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{locale === 'zh'
                        ? `已有 ${add_count} 位用户收藏此网站`
                        : `${add_count} users have bookmarked this site`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {!compact && add_count && add_count >= 10 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="gap-0.5 sm:gap-1 h-4 sm:h-5 text-[9px] sm:text-xs pointer-events-auto px-1 sm:px-1.5">
                        <Flame className="h-2 w-2 sm:h-3 sm:w-3 text-orange-500" />
                        <span className="hidden xs:inline">{locale === 'zh' ? '热门' : 'Hot'}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{locale === 'zh' ? '这是一个热门网站' : 'This is a popular website'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {!compact && description && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5 line-clamp-2 pointer-events-auto leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* 只在非只读模式且非紧凑模式下显示底部按钮 */}
      {!isReadOnly && !compact && (
        <CardFooter className="p-2 sm:p-3 pt-0 z-10 pointer-events-auto">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="w-full gap-1 hover:bg-primary/10 transition-colors h-7 sm:h-8 text-[10px] sm:text-xs">
              <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline">{locale === 'zh' ? '访问网站' : 'Visit'}</span>
              <span className="xs:hidden">{locale === 'zh' ? '访问' : 'Go'}</span>
            </Button>
          </a>
        </CardFooter>
      )}
    </Card>
  );
}
