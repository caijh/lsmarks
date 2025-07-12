"use client";

import { BookmarkCategory } from "@/types/bookmark/category";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PermissionGuard } from "../shared/permission-guard";
import { useRef, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryNavProps {
  categories: BookmarkCategory[];
  selectedCategoryUuid?: string;
  onSelectCategory: (categoryUuid: string) => void;
  isOwner: boolean;
  editMode?: boolean;
  onAddCategory?: () => void;
  onEditCategory?: (category: BookmarkCategory) => void;
  onDeleteCategory?: (category: BookmarkCategory) => void;
  locale?: string; // 添加语言参数
}

export function CategoryNav({
  categories,
  selectedCategoryUuid,
  onSelectCategory,
  isOwner,
  editMode = false,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  locale = 'zh', // 默认为中文
}: CategoryNavProps) {
  // 如果没有选中的分类，但有分类列表，则默认选中第一个
  const effectiveSelectedUuid =
    selectedCategoryUuid || (categories.length > 0 ? categories[0].uuid : undefined);

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

    // 添加一些容错空间
    const tolerance = 2;
    setCanScrollLeft(scrollLeft > tolerance);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - tolerance);
    setShowScrollIndicators(scrollWidth > clientWidth + tolerance);
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

  // 滚动到选中的分类
  const scrollToSelected = () => {
    const container = scrollContainerRef.current;
    if (!container || !effectiveSelectedUuid) return;

    const selectedElement = container.querySelector(`[data-category-uuid="${effectiveSelectedUuid}"]`) as HTMLElement;
    if (!selectedElement) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = selectedElement.getBoundingClientRect();

    if (elementRect.left < containerRect.left || elementRect.right > containerRect.right) {
      const scrollLeft = selectedElement.offsetLeft - (container.clientWidth - selectedElement.clientWidth) / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
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
  }, [categories]);

  // 当选中的分类改变时，滚动到该分类
  useEffect(() => {
    if (isMobile && effectiveSelectedUuid) {
      setTimeout(scrollToSelected, 100);
    }
  }, [effectiveSelectedUuid, isMobile]);

  return (
    <div className="mb-6">
      <div className="relative">
        {/* 移动端左右滑动按钮 */}
        {isMobile && showScrollIndicators && (
          <>
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                onClick={() => scrollTo('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                onClick={() => scrollTo('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {/* 移动端滑动提示渐变 */}
        {isMobile && showScrollIndicators && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
          </>
        )}

        {/* 滑动容器 - 优化移动端体验 */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto scrollbar-hide horizontal-scroll category-nav-container"
          style={{
            padding: '8px 16px',
            overflowX: 'auto',
            overflowY: 'hidden'
          }}
        >
          <div
            className="flex gap-2 sm:gap-3 flex-nowrap"
            style={{
              width: 'max-content',
              minWidth: '100%'
            }}
          >
            {categories.map((category) => (
              <div
                key={category.uuid}
                data-category-uuid={category.uuid}
                onClick={() => onSelectCategory(category.uuid)}
                className={`relative group px-3 sm:px-4 py-2.5 rounded-lg border transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 category-nav-item ${
                  category.uuid === effectiveSelectedUuid
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-card/80 hover:bg-card/90 backdrop-blur-md border-border/50 hover:border-primary/30"
                } font-medium cursor-pointer touch-manipulation`}
                style={{
                  flexShrink: 0,
                  flexGrow: 0,
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <span className="text-sm sm:text-base whitespace-nowrap">{category.name}</span>
                <PermissionGuard isAllowed={isOwner && editMode}>
                  <div className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-background/90 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all duration-150"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory?.(category);
                      }}
                    >
                      <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </div>
                </PermissionGuard>
              </div>
            ))}
          </div>
        </div>

        {/* 移动端滑动指示器点 */}
        {isMobile && showScrollIndicators && categories.length > 3 && (
          <div className="flex justify-center mt-2">
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(categories.length / 3) }).map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
                />
              ))}
            </div>
          </div>
        )}

        {/* 移动端滑动提示文字 */}
        {isMobile && showScrollIndicators && (
          <div className="text-center mt-1">
            <p className="text-xs text-muted-foreground">← 左右滑动查看更多分类 →</p>
          </div>
        )}
      </div>
    </div>
  );
}
