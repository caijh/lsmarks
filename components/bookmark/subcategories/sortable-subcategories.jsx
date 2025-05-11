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
  rectSwappingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Save, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

function SortableSubcategoryItem({ id, subcategory, isSelected }) {
  // 硬编码为中文
  const locale = 'zh';
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
      className={`relative group px-4 py-3 rounded-md border transition-all duration-200 cursor-grab active:cursor-grabbing h-full flex flex-col justify-center ${
        isSelected
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-background hover:bg-accent"
      } ${isDragging ? "border-primary shadow-md scale-105 z-20" : "border-border"} glass-effect`}
      {...attributes}
      {...listeners}
      title={locale === 'zh' ? "拖拽调整位置" : "Drag to reorder"}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 flex-shrink-0 text-current opacity-50 group-hover:opacity-100" />
        <span className="truncate font-medium text-center">{subcategory.name}</span>
      </div>
      <div className="absolute bottom-1 right-1 text-[10px] opacity-40 group-hover:opacity-70">
        拖拽
      </div>
    </div>
  );
}

export default function SortableSubcategoriesList({
  subcategories,
  selectedSubcategoryUuid,
  onReorder,
  onCancel
}) {
  // 硬编码为中文
  const locale = 'zh';
  const [sortableItems, setSortableItems] = useState(subcategories);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 增加拖拽激活距离，使触发更容易
        tolerance: 8,
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

    const toastId = toast.loading("保存子分类排序中...");

    try {
      // 更新每个子分类的 order_index
      const itemsWithUpdatedOrder = sortableItems.map((item, index) => ({
        ...item,
        order_index: index
      }));

      await onReorder(itemsWithUpdatedOrder);
      setHasChanges(false);

      toast.dismiss(toastId);
      toast.success("子分类排序已保存");
    } catch (error) {
      console.error("Failed to save subcategory order:", error);

      toast.dismiss(toastId);
      toast.error("保存子分类排序失败");

      // 回滚到原始顺序
      setSortableItems(subcategories);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-md border shadow-sm">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          拖拽调整子分类顺序
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

      <div className="bg-muted/30 p-4 rounded-lg border border-dashed relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
          网格拖拽区域
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[]}
        >
          <SortableContext
            items={sortableItems.map(item => item.uuid)}
            strategy={rectSwappingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortableItems.length > 0 ? (
                sortableItems.map((subcategory) => (
                  <SortableSubcategoryItem
                    key={subcategory.uuid}
                    id={subcategory.uuid}
                    subcategory={subcategory}
                    isSelected={subcategory.uuid === selectedSubcategoryUuid}

                  />
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-muted-foreground text-sm">
                  没有可排序的子分类
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
