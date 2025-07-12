"use client";

import { BookmarkSubcategory } from "@/types/bookmark/subcategory";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PermissionGuard } from "../shared/permission-guard";
import { useRef, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubcategoryTabsProps {
  subcategories: BookmarkSubcategory[];
  selectedSubcategoryUuid?: string;
  onSelectSubcategory: (subcategoryUuid: string) => void;
  isOwner: boolean;
  editMode?: boolean;
  onAddSubcategory?: () => void;
  onEditSubcategory?: (subcategory: BookmarkSubcategory) => void;
  onDeleteSubcategory?: (subcategory: BookmarkSubcategory) => void;
}

export function SubcategoryTabs({
  subcategories,
  selectedSubcategoryUuid,
  onSelectSubcategory,
  isOwner,
  editMode = false,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
}: SubcategoryTabsProps) {
  // 如果没有选中的子分类，但有子分类列表，则默认选中第一个
  const effectiveSelectedUuid =
    selectedSubcategoryUuid || (subcategories.length > 0 ? subcategories[0].uuid : undefined);

  // 移动端滑动相关状态
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showScrollIndicators, setShowScrollIndicators] = useState(false);

  // 检查滚动状态
  const checkScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    setShowScrollIndicators(scrollWidth > clientWidth);
  };

  // 滚动到指定位置
  const scrollTo = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  };

  // 监听滚动事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollState();
    container.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);

    return () => {
      container.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [subcategories]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 relative">
          {/* 移动端左右滑动按钮 */}
          {isMobile && showScrollIndicators && (
            <>
              {canScrollLeft && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                  onClick={() => scrollTo('left')}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              )}
              {canScrollRight && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                  onClick={() => scrollTo('right')}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          )}

          {/* 移动端滑动提示渐变 */}
          {isMobile && showScrollIndicators && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
            </>
          )}

          <Tabs
            value={effectiveSelectedUuid}
            onValueChange={onSelectSubcategory}
            className="w-full"
          >
            <TabsList
              ref={scrollContainerRef}
              className="w-full justify-start overflow-x-auto scrollbar-hide horizontal-scroll px-6 sm:px-2"
            >
              {subcategories.map((subcategory) => (
                <TabsTrigger
                  key={subcategory.uuid}
                  value={subcategory.uuid}
                  className="relative group min-w-fit px-3 sm:px-4 pr-4 sm:pr-6 flex-shrink-0 touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span className="text-sm whitespace-nowrap">{subcategory.name}</span>
                  <PermissionGuard isAllowed={isOwner && editMode}>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 mr-[-16px] sm:mr-[-20px] hidden group-hover:flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-background shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSubcategory?.(subcategory);
                        }}
                      >
                        <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-background shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSubcategory?.(subcategory);
                        }}
                      >
                        <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                  </PermissionGuard>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <PermissionGuard isAllowed={isOwner && editMode}>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSubcategory}
            className="ml-2 whitespace-nowrap flex-shrink-0 h-8 px-2 sm:px-3"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">添加子分类</span>
            <span className="sm:hidden">添加</span>
          </Button>
        </PermissionGuard>
      </div>

      {/* 移动端滑动提示文字 */}
      {isMobile && showScrollIndicators && subcategories.length > 2 && (
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">← 左右滑动查看更多子分类 →</p>
        </div>
      )}
    </div>
  );
}
