"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookmarkItem, BookmarkItemFormData } from "@/types/bookmark/item";
import { BookmarkItemForm } from "../forms";

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BookmarkItem | null;
  mode: "create" | "edit";
  subcategoryUuid: string;
  onSave: (data: BookmarkItemFormData) => Promise<void>;
  onDelete?: (item: BookmarkItem) => void;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  item,
  mode,
  subcategoryUuid,
  onSave,
  onDelete,
}: ItemFormDialogProps) {
  // 硬编码为中文
  const locale = 'zh';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // 添加一个key来强制重新渲染表单

  // 当对话框打开或关闭时，重置表单key
  useEffect(() => {
    if (open) {
      setFormKey(Date.now());
    }
  }, [open]);

  // 创建一个引用来存储表单提交函数
  const formSubmitRef = useRef<(() => void) | null>(null);

  // 创建一个回调函数，用于子组件注册提交函数
  const registerSubmit = useCallback((submitFn: () => void) => {
    formSubmitRef.current = submitFn;
  }, []);

  const handleSubmit = async (data: BookmarkItemFormData) => {
    setIsSubmitting(true);
    try {
      // 显示保存中的提示
      const toastId = toast.loading(locale === 'zh' ? '正在保存书签...' : 'Saving bookmark...');

      await onSave(data);

      // 更新提示为成功
      toast.success(locale === 'zh' ? '书签已保存' : 'Bookmark saved', {
        id: toastId,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving item:", error);

      // 显示错误提示
      toast.error(
        locale === 'zh'
          ? '保存书签时出错，请稍后重试'
          : 'Error saving bookmark, please try again later',
        {
          description: error instanceof Error ? error.message : undefined,
          icon: <AlertCircle className="h-5 w-5" />,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 准备初始数据
  const initialData: BookmarkItemFormData | undefined = item
    ? {
        title: item.title,
        url: item.url,
        description: item.description,
        icon_url: item.icon_url,
        subcategory_uuid: item.subcategory_uuid,
      }
    : {
        title: "",
        url: "",
        description: "",
        icon_url: "",
        subcategory_uuid: subcategoryUuid,
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? (locale === 'zh' ? "添加新书签" : "Add New Bookmark")
              : (locale === 'zh' ? "编辑书签" : "Edit Bookmark")}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? (locale === 'zh' ? "添加一个新的书签到当前子分类。" : "Add a new bookmark to the current subcategory.")
              : (locale === 'zh' ? "编辑现有的书签信息。" : "Edit existing bookmark information.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <BookmarkItemForm
            key={formKey} // 使用key强制重新渲染
            initialData={initialData}
            subcategoryUuid={subcategoryUuid}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            locale={locale}
            showSubmitButton={false} /* 不显示表单内的提交按钮 */
            registerSubmit={registerSubmit} // 传递注册函数
          />

          <div className="flex justify-between items-center pt-4 border-t">
            {mode === "edit" && item && onDelete ? (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(item);
                  onOpenChange(false);
                }}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {locale === 'zh' ? '删除书签' : 'Delete Bookmark'}
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
