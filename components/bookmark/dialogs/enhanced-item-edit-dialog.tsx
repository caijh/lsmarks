"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertCircle, MoveVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookmarkItem, BookmarkItemFormData } from "@/types/bookmark/item";
import { BookmarkCategoryWithSubcategories } from "@/types/bookmark/category";
import { EnhancedBookmarkEditForm } from "../items/enhanced-edit-form";

interface EnhancedItemEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BookmarkItem;
  categories: BookmarkCategoryWithSubcategories[];
  currentCategoryUuid: string;
  onSave: (data: BookmarkItemFormData & { category_uuid: string }) => Promise<void>;
  onDelete?: (item: BookmarkItem) => void;
}

export function EnhancedItemEditDialog({
  open,
  onOpenChange,
  item,
  categories,
  currentCategoryUuid,
  onSave,
  onDelete,
}: EnhancedItemEditDialogProps) {
  const locale = 'zh';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  // 当对话框打开或关闭时，重置表单key
  useEffect(() => {
    if (open) {
      setFormKey(Date.now());
    }
  }, [open]);

  // 创建一个引用来存储表单提交函数
  const formSubmitRef = useRef<(() => void) | null>(null);

  // 注册表单提交函数
  const registerFormSubmit = useCallback((submitFn: () => void) => {
    formSubmitRef.current = submitFn;
  }, []);

  // 处理表单提交
  const handleSubmit = useCallback(async (data: BookmarkItemFormData & { category_uuid: string }) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      onOpenChange(false);
      toast.success("书签更新成功");
    } catch (error) {
      console.error("更新书签失败:", error);
      toast.error("更新书签失败");
    } finally {
      setIsSubmitting(false);
    }
  }, [onSave, onOpenChange]);

  // 处理删除
  const handleDelete = useCallback(() => {
    if (onDelete && item) {
      onDelete(item);
    }
  }, [onDelete, item]);

  // 准备初始数据
  const initialData = item ? {
    title: item.title,
    url: item.url,
    description: item.description || "",
    icon_url: item.icon_url || "",
    subcategory_uuid: item.subcategory_uuid,
    category_uuid: currentCategoryUuid,
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveVertical className="h-5 w-5" />
            编辑书签
          </DialogTitle>
          <DialogDescription>
            编辑书签信息，您可以修改内容或将书签移动到其他分类。
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <EnhancedBookmarkEditForm
            key={formKey}
            initialData={initialData}
            categories={categories}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            locale={locale}
            showSubmitButton={false}
            registerSubmit={registerFormSubmit}
          />

          {/* 底部按钮区域 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <div className="flex-1">
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除书签
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                取消
              </Button>
              <Button
                type="button"
                onClick={() => formSubmitRef.current?.()}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "保存中..." : "保存更改"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
