"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookmarkCategory, BookmarkCategoryFormData } from "@/types/bookmark/category";
import { BookmarkCategoryForm } from "../categories/form";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: BookmarkCategory | null;
  mode: "create" | "edit";
  collectionUuid: string;
  onSave: (data: BookmarkCategoryFormData) => Promise<void>;
  onDelete?: (category: BookmarkCategory) => void;
  locale?: string; // 添加语言参数
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  mode,
  collectionUuid,
  onSave,
  onDelete,
  locale = 'zh', // 默认为中文
}: CategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // 添加一个key来强制重新渲染表单

  // 当对话框打开或关闭时，重置表单key
  useEffect(() => {
    if (open) {
      setFormKey(Date.now());
    }
  }, [open]);

  const handleSubmit = async (data: BookmarkCategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 准备初始数据
  const initialData: BookmarkCategoryFormData | undefined = category
    ? {
        name: category.name,
        collection_uuid: category.collection_uuid,
      }
    : undefined;

  // 创建一个引用来存储表单提交函数
  const formSubmitRef = useRef<(() => void) | null>(null);

  // 创建一个回调函数，用于子组件注册提交函数
  const registerSubmit = useCallback((submitFn: () => void) => {
    formSubmitRef.current = submitFn;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? (locale === 'zh' ? "创建新分类" : "Create New Category")
              : (locale === 'zh' ? "编辑分类" : "Edit Category")}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? (locale === 'zh' ? "创建一个新的分类来组织你的书签。" : "Create a new category to organize your bookmarks.")
              : (locale === 'zh' ? "编辑现有的分类信息。" : "Edit existing category information.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <BookmarkCategoryForm
            key={formKey} // 使用key强制重新渲染
            initialData={initialData}
            collectionUuid={collectionUuid}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            locale={locale}
            showSubmitButton={false} /* 不显示表单内的提交按钮 */
            registerSubmit={registerSubmit} // 传递注册函数
          />

          <div className="flex justify-between items-center pt-4 border-t">
            {mode === "edit" && category && onDelete ? (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(category);
                  onOpenChange(false);
                }}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {locale === 'zh' ? '删除分类' : 'Delete Category'}
              </Button>
            ) : (
              <div></div> /* 占位元素，保持布局 */
            )}

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                // 调用子组件的提交函数
                if (formSubmitRef.current) {
                  formSubmitRef.current();
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {locale === 'zh' ? '保存中...' : 'Saving...'}
                </>
              ) : (
                locale === 'zh' ? '保存' : 'Save'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
