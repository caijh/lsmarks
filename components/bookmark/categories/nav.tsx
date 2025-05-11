"use client";

import { BookmarkCategory } from "@/types/bookmark/category";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { PermissionGuard } from "../shared/permission-guard";

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

  return (
    <div className="mb-6">
      <div className="relative">
        {/* 删除了左右两侧的白色渐变效果 */}

        <div className="w-full overflow-x-auto px-4 py-2 flex justify-center">
          <div className="inline-flex gap-3 flex-nowrap md:flex-wrap justify-center min-w-0 md:min-w-full">
            {categories.map((category) => (
              <div
                key={category.uuid}
                onClick={() => onSelectCategory(category.uuid)}
                className={`relative group px-4 py-2 rounded-md border transition-all duration-200 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md ${
                  category.uuid === effectiveSelectedUuid
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                    : "bg-background hover:bg-accent"
                } glass-effect font-medium cursor-pointer`}
              >
                {category.name}
                <PermissionGuard isAllowed={isOwner && editMode}>
                  <div className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-background/90 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all duration-150"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory?.(category);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </PermissionGuard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
