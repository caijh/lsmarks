"use client";

import { BookmarkCollection, BookmarkCollectionWithStats } from "@/types/bookmark/collection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink, Lock, Globe, MoreVertical, FolderOpen } from "@/components/ui/icons";
import Image from "next/image";
import Link from "next/link";
import { PermissionGuard } from "../shared/permission-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLongPress, useIsTouchDevice } from "@/hooks/use-mobile-gestures";
import { useState } from "react";

interface BookmarkCollectionCardProps {
  collection: BookmarkCollection | BookmarkCollectionWithStats;
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (collection: BookmarkCollection | BookmarkCollectionWithStats) => void;
  onDelete?: (collection: BookmarkCollection | BookmarkCollectionWithStats) => void;
  locale?: string; // 添加语言参数
}

export function BookmarkCollectionCard({
  collection,
  isOwner,
  editMode = false,
  onEdit,
  onDelete,
  locale = 'zh', // 默认为中文
}: BookmarkCollectionCardProps) {
  const { name, description, is_public, cover_url } = collection;
  // 安全地访问可选属性
  const category_count = 'category_count' in collection ? collection.category_count : undefined;
  const bookmark_count = 'bookmark_count' in collection ? collection.bookmark_count : undefined;

  // 移动端手势支持
  const isTouchDevice = useIsTouchDevice();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 长按手势处理
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (isTouchDevice && isOwner && editMode) {
        setShowMobileMenu(true);
      }
    },
    delay: 600,
    threshold: 15
  });

  return (
    <Card
      className={`overflow-hidden h-full flex flex-col relative group hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border border-border/60 bg-card/65 backdrop-blur-sm shadow-md
        ${longPressHandlers.isLongPressing ? 'ring-2 ring-primary/50 shadow-lg' : ''}`}
      {...(isTouchDevice && isOwner && editMode ? longPressHandlers : {})}
    >
      {/* 卡片内主题渐变背景 */}
      <div className="absolute inset-0 bg-gradient-primary-subtle opacity-60 -z-10"></div>
      <div className="absolute inset-0 bg-gradient-primary-radial opacity-40 -z-10"></div>

      {/* 右上角的操作菜单 */}
      <PermissionGuard isAllowed={isOwner && editMode}>
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30">
          <DropdownMenu open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-background/80 backdrop-blur-sm ${isTouchDevice ? 'sm:block hidden' : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sr-only">{locale === 'zh' ? '打开菜单' : 'Open menu'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowMobileMenu(false);
                  onEdit?.(collection);
                }}
              >
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                {locale === 'zh' ? '编辑集合' : 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowMobileMenu(false);
                  onDelete?.(collection);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                {locale === 'zh' ? '删除集合' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PermissionGuard>

      {/* 移动端长按提示 */}
      {isTouchDevice && isOwner && editMode && longPressHandlers.isLongPressing && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-40 rounded-md">
          <div className="bg-background/90 px-3 py-2 rounded-md shadow-lg border">
            <p className="text-xs text-muted-foreground">松开显示菜单</p>
          </div>
        </div>
      )}

      {/* 使整个卡片可点击 */}
      <Link
        href={`/collections/${'user_username' in collection ? collection.user_username : `user_${collection.user_uuid.substring(0, 8)}`}/${collection.slug || collection.uuid}`}
        className="absolute inset-0 z-20"
        aria-label={locale === 'zh' ? `查看 ${name} 集合` : `View ${name} collection`}
      >
        <span className="sr-only">{locale === 'zh' ? `查看 ${name} 集合` : `View ${name} collection`}</span>
      </Link>

      <CardContent className="flex-grow p-3 sm:p-4 md:p-5 z-10 relative">
        {/* 查看图标，与favicon保持相同的大小、左边距和下边距 */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-3 sm:left-4 md:left-5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className={`flex items-center justify-center w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 rounded-md p-1 sm:p-1.5 border border-border/70 shadow-sm bg-background/90 backdrop-blur-sm relative overflow-hidden`}>
            {/* 图标内部渐变 */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/10"></div>
            <div className="absolute inset-0 bg-gradient-primary-radial opacity-30"></div>

            <ExternalLink className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${is_public ? 'text-primary' : 'text-slate-600'} relative z-10`} />
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
          <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 relative rounded-md flex items-center justify-center">
            {/* 图标容器背景效果 */}
            <div className={`absolute inset-0 ${is_public ? 'bg-primary/15' : 'bg-slate-500/15'} rounded-md blur-[2px]`}></div>
            <div className="absolute inset-0 bg-gradient-primary-radial opacity-50 rounded-md"></div>

            <div className="relative z-10 bg-background/90 backdrop-blur-sm rounded-md p-1 sm:p-1.5 md:p-2 border border-border/70 shadow-sm flex items-center justify-center w-full h-full overflow-hidden">
              {/* 图标内部渐变 */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5"></div>

              {cover_url ? (
                <Image
                  src={cover_url}
                  alt={name}
                  width={28}
                  height={28}
                  className="object-contain relative z-10 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                />
              ) : (
                <FolderOpen className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${is_public ? 'text-primary' : 'text-slate-600'} relative z-10`} />
              )}
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-medium truncate leading-tight">{name}</h3>
            <div className="flex items-center flex-wrap gap-1 sm:gap-1.5 md:gap-2 mt-1 sm:mt-1.5 md:mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={is_public ? "default" : "outline"}
                      className={`gap-0.5 sm:gap-1 h-4 sm:h-5 text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 ${is_public ? 'bg-primary/20 hover:bg-primary/30 text-gray-700 dark:text-primary-foreground border-primary/40 shadow-sm' : 'bg-slate-500/15 hover:bg-slate-500/25 text-slate-700 dark:text-slate-300 border-slate-500/30 shadow-sm'}`}
                    >
                      {is_public ? (
                        <Globe className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
                      ) : (
                        <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
                      )}
                      <span className="hidden xs:inline">
                        {is_public
                          ? (locale === 'zh' ? "公开" : "Public")
                          : (locale === 'zh' ? "私有" : "Private")}
                      </span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{is_public
                      ? (locale === 'zh' ? "所有人可见" : "Visible to everyone")
                      : (locale === 'zh' ? "仅自己可见" : "Only visible to you")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {category_count !== undefined && category_count > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="gap-0.5 sm:gap-1 h-4 sm:h-5 text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 bg-primary/15 border-primary/30 text-gray-700 dark:text-primary/90 shadow-sm"
                      >
                        <FolderOpen className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
                        <span>{category_count}</span>
                        <span className="hidden sm:inline">
                          {locale === 'zh' ? '分类' : (category_count === 1 ? 'cat' : 'cats')}
                        </span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{locale === 'zh'
                        ? `${category_count} 个分类`
                        : `${category_count} ${category_count === 1 ? 'category' : 'categories'}`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="mt-2 sm:mt-2.5 md:mt-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-muted/50 rounded-md border border-border/60 shadow-inner relative overflow-hidden">
              {/* 描述框内主题渐变背景 */}
              <div className="absolute inset-0 bg-gradient-primary-subtle opacity-30 -z-10"></div>
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent to-primary/5 -z-10"></div>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground line-clamp-2 relative z-10 leading-relaxed">
                {description || (locale === 'zh' ? '暂无描述' : 'No description')}
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
