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
    <Card className={`overflow-hidden h-full flex flex-col relative group bg-card/65 backdrop-blur-sm
      ${!isReadOnly ? 'hover:shadow-md transition-all duration-200 hover:-translate-y-1' : ''}
      ${compact ? 'p-0 border-border/40 hover:border-primary/30' : ''}
      ${className}`}>
      {/* 右上角的操作菜单 - 只在非只读模式下显示 */}
      {!isReadOnly && (
        <PermissionGuard isAllowed={isOwner && editMode}>
          <div className="absolute top-2 right-2 z-20 pointer-events-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-background/80 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">{locale === 'zh' ? '打开菜单' : 'Open menu'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onEdit?.(item);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {locale === 'zh' ? '编辑' : 'Edit'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete?.(item);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {locale === 'zh' ? '删除' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PermissionGuard>
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

      <CardContent className={`flex-grow ${compact ? 'p-3' : 'p-3'} z-10 relative pointer-events-none`}>
        <div className="flex items-start gap-2">
          <div className={`flex-shrink-0 ${compact ? 'w-7 h-7' : 'w-8 h-8'} relative bg-background rounded-md p-1 border flex items-center justify-center pointer-events-auto`}>
            {/* 使用改进后的FallbackIcon组件 */}
            <FallbackIcon
              url={url}
              title={title}
              initialIconUrl={icon_url}
              compact={compact}
            />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className={`${compact ? 'text-sm' : 'text-sm'} font-medium truncate pointer-events-auto`}>
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
            <div className="flex items-center flex-wrap gap-1 mt-0.5">
              <span className={`${compact ? 'text-xs' : 'text-xs'} text-muted-foreground truncate pointer-events-auto`}>
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
                      <Badge variant="outline" className="gap-1 h-5 text-xs pointer-events-auto">
                        <Bookmark className="h-3 w-3" />
                        {add_count}
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
                      <Badge variant="secondary" className="gap-1 h-5 text-xs pointer-events-auto">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {locale === 'zh' ? '热门' : 'Popular'}
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
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 pointer-events-auto">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* 只在非只读模式且非紧凑模式下显示底部按钮 */}
      {!isReadOnly && !compact && (
        <CardFooter className="p-3 pt-0 z-10 pointer-events-auto">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="w-full gap-1 hover:bg-primary/10 transition-colors h-8 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              {locale === 'zh' ? '阿弥陀佛' : 'Visit Website'}
            </Button>
          </a>
        </CardFooter>
      )}
    </Card>
  );
}
