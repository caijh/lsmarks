"use client";

import { useState, useEffect } from "react";
import { Reorder, useDragControls, motion } from "framer-motion";
import { DragHandle } from "./drag-handle";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface SortableListProps<T> {
  items: T[];
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  keyExtractor: (item: T) => string;
  onReorder: (items: T[]) => Promise<void>;
  className?: string;
  itemClassName?: string;
}

export function SortableList<T>({
  items,
  renderItem,
  keyExtractor,
  onReorder,
  className = "",
  itemClassName = "",
}: SortableListProps<T>) {
  const [sortableItems, setSortableItems] = useState<T[]>(items);
  const [isSorting, setIsSorting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 当外部items变化时更新内部状态
  useEffect(() => {
    // 确保每个项目都有order_index属性
    const itemsWithIndex = items.map((item, index) => ({
      ...item,
      // @ts-ignore - 我们不知道T是否有order_index属性，但我们会尝试设置它
      order_index: item.order_index !== undefined ? item.order_index : index
    }));

    // @ts-ignore - TypeScript不知道itemsWithIndex是T[]类型
    setSortableItems(itemsWithIndex);
  }, [items]);

  // 处理排序变化
  const handleReorder = (newOrder: T[]) => {
    // 更新每个项目的order_index
    const updatedOrder = newOrder.map((item, index) => ({
      ...item,
      // @ts-ignore - 我们不知道T是否有order_index属性，但我们会尝试设置它
      order_index: index
    }));

    // @ts-ignore - TypeScript不知道updatedOrder是T[]类型
    setSortableItems(updatedOrder);
    setHasChanges(true);
  };

  // 处理拖拽结束
  const handleDragEnd = async () => {
    if (hasChanges) {
      // 显示保存中提示，并获取toast ID以便后续关闭
      const toastId = toast.loading("保存排序中...");

      try {
        await handleSaveOrder();

        // 成功后关闭loading提示
        toast.dismiss(toastId);
      } catch (error) {
        // 失败后关闭loading提示
        toast.dismiss(toastId);
        toast.error("保存排序失败");
      }
    }
  };

  // 保存排序
  const handleSaveOrder = async () => {
    setIsSubmitting(true);
    try {
      // 确保每个项目都有正确的order_index
      const itemsToSave = sortableItems.map((item, index) => ({
        ...item,
        // @ts-ignore - 我们不知道T是否有order_index属性，但我们会尝试设置它
        order_index: index
      }));

      // @ts-ignore - TypeScript不知道itemsToSave是T[]类型
      await onReorder(itemsToSave);
      setIsSorting(false);
      setHasChanges(false);
      // 不在这里显示toast，而是在调用者中处理
    } catch (error) {
      console.error(error);
      throw error; // 重新抛出错误，让调用者处理
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消排序
  const handleCancelSort = () => {
    setSortableItems(items);
    setIsSorting(false);
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isSorting ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelSort}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSaveOrder}
              disabled={!hasChanges || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mr-1"
                  >
                    ⟳
                  </motion.div>
                  保存中...
                </span>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  保存排序
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSorting(true)}
          >
            排序
          </Button>
        )}
      </div>

      {isSorting ? (
        <Reorder.Group
          axis="y"
          values={sortableItems}
          onReorder={handleReorder}
          onDragEnd={handleDragEnd}
          className={`space-y-2 ${className}`}
        >
          {sortableItems.map((item) => (
            <SortableItem
              key={keyExtractor(item)}
              item={item}
              renderItem={renderItem}
              className={itemClassName}
            />
          ))}
        </Reorder.Group>
      ) : (
        <div className={`space-y-2 ${className}`}>
          {sortableItems.map((item) => (
            <div key={keyExtractor(item)} className={itemClassName}>
              {renderItem(item, false)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SortableItemProps<T> {
  item: T;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  className?: string;
}

function SortableItem<T>({
  item,
  renderItem,
  className = "",
}: SortableItemProps<T>) {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  // 获取当前项目的索引
  const getItemIndex = () => {
    // 尝试从item中获取order_index属性
    // @ts-ignore - 我们不知道T是否有order_index属性，但我们会尝试获取它
    const orderIndex = item.order_index;
    return typeof orderIndex === 'number' ? orderIndex + 1 : '•';
  };

  return (
    <Reorder.Item
      value={item}
      dragControls={dragControls}
      dragListener={false}
      className={`flex items-center gap-2 ${className}`}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mr-1">
          {getItemIndex()}
        </div>
        <DragHandle
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        />
      </div>
      <div className="flex-grow">
        {renderItem(item, isDragging)}
      </div>
    </Reorder.Item>
  );
}
