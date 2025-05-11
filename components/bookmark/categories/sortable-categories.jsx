"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Save, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

function SortableCategoryItem({ id, category, isSelected }) {
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
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group px-4 py-2 rounded-md border transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isSelected
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-background hover:bg-accent"
      } ${isDragging ? "border-primary shadow-md" : "border-border"} glass-effect font-medium`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-current opacity-50 group-hover:opacity-100" />
        <span>{category.name}</span>
      </div>
    </div>
  );
}

export default function SortableCategoriesList({
  categories,
  selectedCategoryUuid,
  onReorder,
  onCancel
}) {
  // 硬编码为中文
  const locale = 'zh';
  const [sortableItems, setSortableItems] = useState(categories);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
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

    const toastId = toast.loading("保存分类排序中...");

    try {
      // 更新每个分类的 order_index
      const itemsWithUpdatedOrder = sortableItems.map((item, index) => ({
        ...item,
        order_index: index
      }));

      await onReorder(itemsWithUpdatedOrder);
      setHasChanges(false);

      toast.dismiss(toastId);
      toast.success("分类排序已保存");
    } catch (error) {
      console.error("Failed to save category order:", error);

      toast.dismiss(toastId);
      toast.error("保存分类排序失败");

      // 回滚到原始顺序
      setSortableItems(categories);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-md border">
        <h3 className="text-sm font-medium">
          拖拽调整分类顺序
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            取消
          </Button>
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
      </div>

      <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableItems.map(item => item.uuid)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {sortableItems.map((category) => (
                <SortableCategoryItem
                  key={category.uuid}
                  id={category.uuid}
                  category={category}
                  isSelected={category.uuid === selectedCategoryUuid}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
