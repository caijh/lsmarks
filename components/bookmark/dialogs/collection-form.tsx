"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookmarkCollection, BookmarkCollectionFormData } from "@/types/bookmark/collection";
import { BookmarkCollectionForm } from "../forms";
import { Bookmark, BookmarkPlus, FolderPlus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: BookmarkCollection | null;
  mode: "create" | "edit";
  onSave: (data: BookmarkCollectionFormData) => Promise<void>;
  locale?: string; // 添加语言参数
}

export function CollectionFormDialog({
  open,
  onOpenChange,
  collection,
  mode,
  onSave,
  locale = 'zh', // 默认为中文
}: CollectionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BookmarkCollectionFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 准备初始数据
  const initialData: BookmarkCollectionFormData | undefined = collection
    ? {
        name: collection.name,
        description: collection.description,
        is_public: collection.is_public,
        slug: collection.slug,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card/80 backdrop-blur-md border-primary/20 shadow-lg animate-in fade-in-50 duration-300 overflow-hidden">
        {/* 装饰背景元素 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 -z-10"></div>
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-2">
            {mode === "create" ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <FolderPlus className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
            )}
            <DialogTitle className="text-xl font-semibold">
              {mode === "create"
                ? (locale === 'zh' ? "创建新集合" : "Create New Collection")
                : (locale === 'zh' ? "编辑集合" : "Edit Collection")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground/90 text-sm">
            {mode === "create"
              ? (locale === 'zh' ? "创建一个新的书签集合来组织你的书签。填写以下信息以创建集合。" : "Create a new bookmark collection to organize your bookmarks. Fill in the information below to create your collection.")
              : (locale === 'zh' ? "编辑现有的书签集合信息。修改以下字段来更新集合。" : "Edit the existing bookmark collection information. Modify the fields below to update your collection.")}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary/30 via-primary/10 to-transparent rounded-full"></div>
          <div className="pl-4">
            <BookmarkCollectionForm
              initialData={initialData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              locale={locale}
              showSubmitButton={false}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2 border-t border-border/30 mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {locale === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium bg-primary/90 text-primary-foreground hover:bg-primary transition-colors flex items-center gap-2",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
            onClick={() => document.getElementById('collection-form-submit')?.click()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'zh' ? '保存中...' : 'Saving...'}
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" />
                {locale === 'zh' ? '保存集合' : 'Save Collection'}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
