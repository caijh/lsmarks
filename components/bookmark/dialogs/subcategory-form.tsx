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
import { BookmarkSubcategory, BookmarkSubcategoryFormData } from "@/types/bookmark/subcategory";
import { BookmarkSubcategoryForm } from "../subcategories/form";

interface SubcategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategory?: BookmarkSubcategory | null;
  mode: "create" | "edit";
  categoryUuid: string;
  onSave: (data: BookmarkSubcategoryFormData) => Promise<void>;
  onDelete?: (subcategory: BookmarkSubcategory) => void;
  locale?: string; // 添加语言参数
}

export function SubcategoryFormDialog({
  open,
  onOpenChange,
  subcategory,
  mode,
  categoryUuid,
  onSave,
  onDelete,
  locale = 'zh', // 默认为中文
}: SubcategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // 添加一个key来强制重新渲染表单

  // 当对话框打开或关闭时，重置表单key
  useEffect(() => {
    if (open) {
      setFormKey(Date.now());
    }
  }, [open]);

  const handleSubmit = async (data: BookmarkSubcategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving subcategory:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 准备初始数据
  const initialData: BookmarkSubcategoryFormData | undefined = subcategory
    ? {
        name: subcategory.name,
        category_uuid: subcategory.category_uuid,
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
              ? (locale === 'zh' ? "创建新子分类" : "Create New Subcategory")
              : (locale === 'zh' ? "编辑子分类" : "Edit Subcategory")}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? (locale === 'zh' ? "创建一个新的子分类来组织你的书签。" : "Create a new subcategory to organize your bookmarks.")
              : (locale === 'zh' ? "编辑现有的子分类信息。" : "Edit existing subcategory information.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <BookmarkSubcategoryForm
            key={formKey} // 使用key强制重新渲染
            initialData={initialData}
            categoryUuid={categoryUuid}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            locale={locale}
            showSubmitButton={false} /* 不显示表单内的提交按钮 */
            registerSubmit={registerSubmit} // 传递注册函数
          />

          <div className="flex justify-between items-center pt-4 border-t">
            {mode === "edit" && subcategory && onDelete ? (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(subcategory);
                  onOpenChange(false);
                }}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {locale === 'zh' ? '删除子分类' : 'Delete Subcategory'}
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
