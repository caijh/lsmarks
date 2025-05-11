"use client";

import { useState, useEffect } from "react";
import { BookmarkItem } from "@/types/bookmark/item";
import { Button } from "@/components/ui/button";
import { BookmarkItemCard } from "./card";
import { DragHandle } from "../shared/drag-handle";
import { Reorder, useDragControls } from "framer-motion";
import { Plus } from "@/components/ui/icons";
import { PermissionGuard } from "../shared/permission-guard";
import { toast } from "sonner";

interface BookmarkItemListProps {
  items: BookmarkItem[];
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (item: BookmarkItem) => void;
  onDelete?: (item: BookmarkItem) => void;
  onAdd?: () => void;
  onReorder?: (items: BookmarkItem[]) => void;
  reorderEnabled?: boolean; // 添加排序模式状态
  compact?: boolean; // 紧凑模式，用于在"全部"视图中显示
}

export function BookmarkItemList({
  items,
  isOwner,
  editMode = false,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
  reorderEnabled = false, // 默认不启用排序模式
  compact = false, // 默认不启用紧凑模式
}: BookmarkItemListProps) {
  const [sortableItems, setSortableItems] = useState<BookmarkItem[]>([]);

  // 当items变化或启用排序时，更新sortableItems
  useEffect(() => {
    // 复制items并确保每个项目都有order_index
    const itemsWithIndex = items.map((item, index) => ({
      ...item,
      order_index: item.order_index !== undefined ? item.order_index : index
    }));
    setSortableItems(itemsWithIndex);
  }, [items, reorderEnabled]);

  const handleReorder = (newOrder: BookmarkItem[]) => {
    // 更新每个项目的order_index
    const updatedOrder = newOrder.map((item, index) => ({
      ...item,
      order_index: index
    }));
    setSortableItems(updatedOrder);
  };

  const handleReorderComplete = (newOrder: BookmarkItem[]) => {
    // 更新每个项目的order_index
    const updatedOrder = newOrder.map((item, index) => ({
      ...item,
      order_index: index
    }));

    // 立即调用API保存排序
    if (onReorder) {
      // 显示保存中提示，并获取toast ID以便后续关闭
      const toastId = toast.loading("保存排序中...");

      // 调用父组件的onReorder函数，它会调用API保存排序
      onReorder(updatedOrder);

      // 2秒后自动关闭提示
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无书签，请使用右上角的"添加书签"按钮添加书签。
        </div>
      ) : reorderEnabled && onReorder ? (
        <Reorder.Group
          axis="y"
          values={sortableItems}
          onReorder={handleReorder}
          onDragEnd={handleReorderComplete}
          className="space-y-4"
        >
          {sortableItems.map((item) => (
            <ReorderableItem
              key={item.uuid}
              item={item}
              isOwner={isOwner}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Reorder.Group>
      ) : compact ? (
        // 紧凑模式 - 使用更小的网格
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
          {items.map((item) => (
            <BookmarkItemCard
              key={item.uuid}
              item={item}
              isOwner={isOwner}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              compact={true} // 传递紧凑模式到卡片组件
            />
          ))}
        </div>
      ) : (
        // 标准模式
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <BookmarkItemCard
              key={item.uuid}
              item={item}
              isOwner={isOwner}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReorderableItemProps {
  item: BookmarkItem;
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (item: BookmarkItem) => void;
  onDelete?: (item: BookmarkItem) => void;
}

function ReorderableItem({
  item,
  isOwner,
  editMode,
  onEdit,
  onDelete,
}: ReorderableItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragControls={dragControls}
      className="flex items-center gap-2 border rounded-lg p-2 bg-background/65 backdrop-blur-sm"
    >
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mr-1">
          {item.order_index + 1}
        </div>
        <DragHandle
          className="cursor-grab"
          onPointerDown={(e) => dragControls.start(e)}
        />
      </div>
      <div className="flex-grow">
        <BookmarkItemCard
          item={item}
          isOwner={isOwner}
          editMode={editMode}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </Reorder.Item>
  );
}
