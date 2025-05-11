"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookmarkCollection, BookmarkCollectionFormData } from "@/types/bookmark/collection";
import { BookmarkCollectionGrid } from "@/components/bookmark/collections/grid";
import { BookmarkCollectionList } from "@/components/bookmark/collections/list";
import {
  CollectionFormDialog,
  DeleteConfirmationDialog
} from "@/components/bookmark/dialogs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Grid, List } from "@/components/ui/icons";
import { toast } from "sonner";

interface MyCollectionsViewProps {
  collections: BookmarkCollection[];
  currentPage: number;
  totalPages: number;
  userUuid: string;
}

export function MyCollectionsView({
  collections,
  currentPage,
  totalPages,
  userUuid,
  locale = 'zh', // 默认为中文
}: MyCollectionsViewProps & { locale?: string }) {
  const router = useRouter();

  // 状态
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<BookmarkCollection | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // 处理创建集合
  const handleCreateCollection = () => {
    setSelectedCollection(null);
    setFormMode("create");
    setIsCollectionFormOpen(true);
  };

  // 处理编辑集合
  const handleEditCollection = (collection: BookmarkCollection) => {
    setSelectedCollection(collection);
    setFormMode("edit");
    setIsCollectionFormOpen(true);
  };

  // 处理删除集合
  const handleDeleteCollection = (collection: BookmarkCollection) => {
    setSelectedCollection(collection);
    setIsDeleteDialogOpen(true);
  };

  // 处理保存集合
  const handleSaveCollection = async (data: BookmarkCollectionFormData) => {
    try {
      console.log("Saving collection:", data);

      if (formMode === "create") {
        // 创建新集合
        console.log("Creating new collection...");
        const response = await fetch("/api/bookmark/collections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        console.log("API response:", responseData);

        if (!response.ok) {
          console.error("Failed to create collection:", responseData);
          throw new Error(locale === 'zh' ? "创建集合失败" : "Failed to create collection");
        }

        console.log("Collection created successfully:", responseData);
        toast.success(locale === 'zh' ? "集合已创建" : "Collection created");
      } else {
        // 更新现有集合
        console.log("Updating collection:", selectedCollection?.uuid);
        const response = await fetch(`/api/bookmark/collections/${selectedCollection?.uuid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        console.log("API response:", responseData);

        if (!response.ok) {
          console.error("Failed to update collection:", responseData);
          throw new Error(locale === 'zh' ? "更新集合失败" : "Failed to update collection");
        }

        console.log("Collection updated successfully:", responseData);
        toast.success(locale === 'zh' ? "集合已更新" : "Collection updated");
      }

      console.log("Refreshing page...");
      router.refresh();

      // 强制刷新页面以显示新集合
      setTimeout(() => {
        console.log("Force reloading page...");
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (locale === 'zh' ? "操作失败" : "Operation failed"));
      console.error("Error in handleSaveCollection:", error);
    }
  };

  // 处理确认删除
  const handleConfirmDelete = async () => {
    try {
      if (!selectedCollection) return;

      const response = await fetch(`/api/bookmark/collections/${selectedCollection.uuid}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(locale === 'zh' ? "删除集合失败" : "Failed to delete collection");
      }

      toast.success(locale === 'zh' ? "集合已删除" : "Collection deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (locale === 'zh' ? "删除失败" : "Delete failed"));
      console.error(error);
    }
  };

  // 处理页面变化
  const handlePageChange = (page: number) => {
    // 使用 window.location.href 进行导航，不包含语言标记
    window.location.href = `/my-collections?page=${page}`;
  };

  return (
    <>
      {/* 全屏背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-20"></div>
      <div className="fixed top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vh] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed top-1/3 left-1/4 w-[30vw] h-[30vh] bg-primary/3 rounded-full blur-3xl -z-10"></div>

      <div className="container py-0 relative px-3 sm:px-4 md:px-6">

      {/* 页面标题和操作区域 */}
      <div className="relative mb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-primary/5 rounded-lg -z-10 backdrop-blur-sm"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-border/40 rounded-lg shadow-sm bg-card/65 backdrop-blur-sm">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              {locale === 'zh' ? '我的书签集合' : 'My Bookmark Collections'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 max-w-2xl">
              {locale === 'zh'
                ? '管理你的书签集合，包括公开和私有集合。创建新集合来组织你的书签。'
                : 'Manage your bookmark collections, including public and private ones. Create new collections to organize your bookmarks.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end md:self-auto mt-3 md:mt-0">
            <div className="flex gap-2">
              <Button
                onClick={handleCreateCollection}
                className="bg-primary/90 hover:bg-primary shadow-sm text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {locale === 'zh' ? '创建集合' : 'Create Collection'}
              </Button>
            </div>
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
              className="border border-border/40 rounded-md p-0.5 bg-background/65"
            >
              <TabsList className="bg-transparent h-8 sm:h-9">
                <TabsTrigger value="grid" className="data-[state=active]:bg-primary/10 px-2 sm:px-3 h-7 sm:h-8 text-xs sm:text-sm">
                  <Grid className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">{locale === 'zh' ? '网格' : 'Grid'}</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-primary/10 px-2 sm:px-3 h-7 sm:h-8 text-xs sm:text-sm">
                  <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">{locale === 'zh' ? '列表' : 'List'}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-10 sm:py-16 md:py-20 border border-dashed rounded-lg bg-background/65 shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
          <div className="absolute top-10 right-1/4 w-40 h-40 bg-primary/15 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-primary/15 rounded-full blur-3xl -z-10"></div>

          <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-primary/15 mb-4 sm:mb-6 shadow-inner">
            <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h3 className="text-xl sm:text-2xl font-medium mb-2 sm:mb-3">
            {locale === 'zh' ? '没有书签集合' : 'No Collections Yet'}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto px-4 sm:px-0">
            {locale === 'zh'
              ? '你还没有创建任何书签集合。创建第一个集合来开始组织你的书签。'
              : 'You haven\'t created any bookmark collections yet. Create your first collection to start organizing your bookmarks.'}
          </p>
          <Button
            onClick={handleCreateCollection}
            size="default"
            className="bg-primary/90 hover:bg-primary shadow-md text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {locale === 'zh' ? '创建第一个集合' : 'Create Your First Collection'}
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <BookmarkCollectionGrid
          collections={collections}
          isOwner={true}
          editMode={true}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          locale={locale}
        />
      ) : (
        <BookmarkCollectionList
          collections={collections}
          isOwner={true}
          editMode={true}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
        />
      )}

      {/* 对话框组件 */}
      <CollectionFormDialog
        open={isCollectionFormOpen}
        onOpenChange={setIsCollectionFormOpen}
        collection={selectedCollection}
        mode={formMode}
        onSave={handleSaveCollection}
        locale={locale}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemType="collection"
        itemName={selectedCollection?.name}
        onConfirm={handleConfirmDelete}
        locale={locale}
      />
    </div>
    </>
  );
}
