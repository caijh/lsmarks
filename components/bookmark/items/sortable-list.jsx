"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSwappingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BookmarkItemCard } from './card';
import { Button } from '@/components/ui/button';
import { Save, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

function SortableItem({ id, item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 150, // 更快的过渡动画
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)' // 更平滑的动画曲线
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none', // 防止触摸设备上的滚动干扰拖拽
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border ${isDragging ? 'border-primary shadow-md' : 'border-border'} relative group cursor-grab active:cursor-grabbing bg-card/65 backdrop-blur-sm`}
      {...attributes}
      {...listeners}
    >
      {/* 拖拽指示器 - 悬停时显示在卡片上方 */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-sm border">
          <GripVertical className="h-5 w-5 text-primary" />
        </div>
      </div>

      <BookmarkItemCard
        item={item}
        isReadOnly={true}
        className={isDragging ? "bg-muted/50" : ""}
      />
    </div>
  );
}

export default function SortableBookmarkList({
  items,
  onReorder,
  onCancel
}) {
  // 硬编码为中文
  const locale = 'zh';
  const [sortableItems, setSortableItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 降低激活距离，使拖拽更容易触发
      activationConstraint: {
        distance: 4,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortableItems((items) => {
        const oldIndex = items.findIndex(item => item.uuid === active.id);
        const newIndex = items.findIndex(item => item.uuid === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newItems;
      });
    }
  }

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);

    // 显示保存中提示
    const toastId = toast.loading("保存排序中...");

    try {
      // 更新每个项目的 order_index
      const itemsWithUpdatedOrder = sortableItems.map((item, index) => ({
        ...item,
        order_index: index
      }));

      await onReorder(itemsWithUpdatedOrder);
      setHasChanges(false);

      // 成功提示
      toast.dismiss(toastId);
      toast.success("排序已保存");
    } catch (error) {
      console.error("Failed to save order:", error);

      // 错误提示
      toast.dismiss(toastId);
      toast.error("保存排序失败");

      // 回滚到原始顺序
      setSortableItems(items);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-md border">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "保存中..." : "保存排序"}
        </Button>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          直接拖拽书签卡片调整顺序（鼠标悬停时会显示拖拽指示器），完成后点击上方的'保存排序'按钮
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableItems.map(item => item.uuid)}
            strategy={rectSwappingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortableItems.map((item) => (
                <SortableItem key={item.uuid} id={item.uuid} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
