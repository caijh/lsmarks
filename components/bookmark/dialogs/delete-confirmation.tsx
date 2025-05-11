"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "collection" | "category" | "subcategory" | "item" | string;
  itemName?: string;
  onConfirm: () => Promise<void>;
  locale?: string; // 添加语言参数
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemType,
  itemName,
  onConfirm,
  locale = 'zh', // 默认为中文
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

  // 判断是否需要倒计时（只有删除集合时需要）
  const needsCountdown = itemType === "collection";

  // 处理倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open && countdown > 0 && needsCountdown) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }

    if (countdown === 0 || !needsCountdown) {
      setIsConfirmEnabled(true);
    } else {
      setIsConfirmEnabled(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [open, countdown, needsCountdown]);

  // 当对话框打开时重置倒计时
  useEffect(() => {
    if (open) {
      if (needsCountdown) {
        setCountdown(5);
        setIsConfirmEnabled(false);
      } else {
        setIsConfirmEnabled(true);
      }
    }
  }, [open, needsCountdown]);

  const getItemTypeText = (type: string) => {
    switch (type) {
      case "collection":
        return "集合";
      case "category":
        return "分类";
      case "subcategory":
        return "子分类";
      case "item":
        return "书签";
      default:
        return "项目";
    }
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
    } finally {
      setIsDeleting(false);
    }
  };

  const itemTypeText = getItemTypeText(itemType);
  const displayName = itemName
    ? `"${itemName}"`
    : locale === 'zh'
      ? `这个${itemTypeText}`
      : `this ${itemTypeText}`;

  // 计算进度条宽度百分比
  const progressPercentage = ((5 - countdown) / 5) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/65 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {locale === 'zh' ? '确认删除' : 'Confirm Deletion'}
          </DialogTitle>
          {/* 使用 div 替代 DialogDescription，避免嵌套 p 标签 */}
          <div className="text-sm text-muted-foreground pt-2">
            <div className="space-y-2">
              <p>
                {locale === 'zh'
                  ? `你确定要删除${displayName}吗？`
                  : `Are you sure you want to delete ${displayName}?`}
                <strong className="text-destructive">
                  {locale === 'zh' ? '此操作无法撤销。' : 'This action cannot be undone.'}
                </strong>
              </p>
              {itemType === "collection" &&
                <p>
                  {locale === 'zh'
                    ? '这将删除集合中的所有分类、子分类和书签。'
                    : 'This will delete all categories, subcategories, and bookmarks in the collection.'}
                </p>
              }
              {itemType === "category" &&
                <p>
                  {locale === 'zh'
                    ? '这将删除分类中的所有子分类和书签。'
                    : 'This will delete all subcategories and bookmarks in the category.'}
                </p>
              }
              {itemType === "subcategory" &&
                <p>
                  {locale === 'zh'
                    ? '这将删除子分类中的所有书签。'
                    : 'This will delete all bookmarks in the subcategory.'}
                </p>
              }
            </div>
          </div>
        </DialogHeader>

        {needsCountdown && (
          <div className="py-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {locale === 'zh'
                  ? '确认按钮将在倒计时结束后启用'
                  : 'Confirm button will be enabled after countdown'}
              </span>
              <span className="font-bold">
                {countdown}{locale === 'zh' ? '秒' : 's'}
              </span>
            </div>
            {/* 自定义进度条 */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {locale === 'zh' ? '取消' : 'Cancel'}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting || !isConfirmEnabled}
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {locale === 'zh' ? '删除中...' : 'Deleting...'}
              </>
            ) : (
              isConfirmEnabled
                ? (locale === 'zh' ? "确认删除" : "Confirm Delete")
                : needsCountdown
                  ? (locale === 'zh' ? `等待 ${countdown}秒` : `Wait ${countdown}s`)
                  : (locale === 'zh' ? "确认删除" : "Confirm Delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
