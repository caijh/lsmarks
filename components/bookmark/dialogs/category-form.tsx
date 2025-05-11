"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

  // 表单验证模式
  const formSchema = z.object({
    name: z.string().min(1, "名称不能为空").max(255, "名称不能超过255个字符"),
    collection_uuid: z.string().min(1, "集合UUID不能为空"),
  });

  // 创建表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      collection_uuid: collectionUuid,
    },
  });

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
            initialData={initialData}
            collectionUuid={collectionUuid}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            locale={locale}
            showSubmitButton={false} /* 不显示表单内的提交按钮 */
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
              type="submit"
              disabled={isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
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
