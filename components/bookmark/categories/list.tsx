"use client";

import { useState } from "react";
import { BookmarkCategory } from "@/types/bookmark/category";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronRight } from "@/components/ui/icons";
import { PermissionGuard } from "../shared/permission-guard";
import { SortableList } from "../shared/sortable-list";

interface BookmarkCategoryListProps {
  categories: BookmarkCategory[];
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (category: BookmarkCategory) => void;
  onDelete?: (category: BookmarkCategory) => void;
  onSelect?: (category: BookmarkCategory) => void;
  selectedCategoryUuid?: string;
  onReorder?: (categories: BookmarkCategory[]) => void;
}

export function BookmarkCategoryList({
  categories,
  isOwner,
  editMode = false,
  onEdit,
  onDelete,
  onSelect,
  selectedCategoryUuid,
  onReorder,
}: BookmarkCategoryListProps) {
  // 只有在编辑模式下且有onReorder函数时才显示排序功能
  const showSorting = editMode && isOwner && onReorder !== undefined;

  // 渲染分类项
  const renderCategory = (category: BookmarkCategory, isDragging: boolean) => (
    <CategoryItem
      category={category}
      isOwner={isOwner}
      editMode={editMode}
      onEdit={onEdit}
      onDelete={onDelete}
      onSelect={onSelect}
      isSelected={category.uuid === selectedCategoryUuid}
      isDragging={isDragging}
    />
  );

  // 处理排序
  const handleReorder = async (newOrder: BookmarkCategory[]) => {
    if (onReorder) {
      await onReorder(newOrder);
      return Promise.resolve();
    }
    return Promise.reject(new Error("No reorder function provided"));
  };

  return (
    <div className="space-y-2">
      {showSorting ? (
        <SortableList
          items={categories}
          renderItem={renderCategory}
          keyExtractor={(category) => category.uuid}
          onReorder={handleReorder}
          className="space-y-2"
          itemClassName="bg-background"
        />
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <CategoryItem
              key={category.uuid}
              category={category}
              isOwner={isOwner}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              isSelected={category.uuid === selectedCategoryUuid}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryItemProps {
  category: BookmarkCategory;
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (category: BookmarkCategory) => void;
  onDelete?: (category: BookmarkCategory) => void;
  onSelect?: (category: BookmarkCategory) => void;
  isSelected?: boolean;
  isDragging?: boolean;
}

function CategoryItem({
  category,
  isOwner,
  editMode = false,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
  isDragging = false,
}: CategoryItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${
        isSelected ? "bg-muted" : ""
      } ${isDragging ? "border-primary" : ""} ${onSelect ? "cursor-pointer" : ""}`}
      onClick={() => onSelect?.(category)}
    >
      <div className="flex items-center gap-2">
        {onSelect && (
          <div className="text-muted-foreground">
            {isSelected ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
        <div>
          <h3 className="font-medium">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
      </div>
      <PermissionGuard isAllowed={isOwner && editMode}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(category);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(category);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </PermissionGuard>
    </div>
  );
}
