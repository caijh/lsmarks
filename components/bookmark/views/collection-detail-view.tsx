"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCollection } from "@/contexts/collection-context";
import { useEditMode } from "@/contexts/edit-mode-context";
import { BookmarkCollection, BookmarkCollectionWithStats } from "@/types/bookmark/collection";
import { BookmarkCategoryWithSubcategories } from "@/types/bookmark/category";
import { BookmarkSubcategoryWithItems } from "@/types/bookmark/subcategory";
import { BookmarkItem } from "@/types/bookmark/item";
import { EditModeToggle } from "@/components/bookmark/shared/edit-mode-toggle";
import { CategoryNav } from "@/components/bookmark/categories/nav";
import { BookmarkItemList } from "@/components/bookmark/items/list";
import SortableBookmarkList from "@/components/bookmark/items/sortable-list.jsx";
import SortableCategoriesList from "@/components/bookmark/categories/sortable-categories.jsx";
import SortableSubcategoriesList from "@/components/bookmark/subcategories/sortable-subcategories.jsx";

import {
  CategoryFormDialog,
  SubcategoryFormDialog,
  ItemFormDialog,
  QuickAddBookmarkDialog,
  DeleteConfirmationDialog
} from "@/components/bookmark/dialogs";
import { BookmarkletGenerator } from "@/components/bookmark/bookmarklet/generator";
import { Button } from "@/components/ui/button";
// 使用集中导入的图标
import {
  Globe,
  Lock,
  Calendar,
  User,
  Bookmark,
  PlusCircle,
  Edit,
  Trash2,
  Plus,
  BookmarkPlus,
  MoveVertical
} from "@/components/ui/icons";
import { toast } from "sonner";
import { getCurrentUserUuidClient } from "@/services/bookmark/auth";
import { updateCategoriesWithRealData, updateSubcategoriesWithRealData, updateItemsWithRealData } from "@/utils/optimistic-update";

interface CollectionDetailViewProps {
  collection: BookmarkCollection | BookmarkCollectionWithStats;
  categoriesWithSubcategories: BookmarkCategoryWithSubcategories[];
  isOwner: boolean;
  username: string;
  currentUserUuid?: string;
}

export function CollectionDetailView({
  collection,
  categoriesWithSubcategories,
  isOwner,
  username,
}: CollectionDetailViewProps) {
  // 硬编码为中文
  const locale = 'zh';

  const router = useRouter();
  const searchParams = useSearchParams() || null;
  const { setCurrentCollection } = useCollection();

  // 使用全局编辑模式状态
  const {
    editMode,
    setEditMode,
    categoriesReorderEnabled,
    setCategoriesReorderEnabled,
    subcategoriesReorderEnabled,
    setSubcategoriesReorderEnabled,
    bookmarksReorderEnabled,
    setBookmarksReorderEnabled
  } = useEditMode();
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState<string | undefined>(
    categoriesWithSubcategories.length > 0 ? categoriesWithSubcategories[0].uuid : undefined
  );
  const [selectedSubcategoryUuid, setSelectedSubcategoryUuid] = useState<string | undefined>();
  const [currentUserUuid, setCurrentUserUuid] = useState<string | null>(null);
  const [localCategories, setLocalCategories] = useState<BookmarkCategoryWithSubcategories[]>(categoriesWithSubcategories);

  // 本地状态
  const [showBookmarklet, setShowBookmarklet] = useState(false);

  // 检查URL参数，如果有bookmarklet=true，则自动打开添加书签对话框
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false);
  const [bookmarkletUrl, setBookmarkletUrl] = useState<string | null>(null);
  const [bookmarkletTitle, setBookmarkletTitle] = useState<string | null>(null);
  const [bookmarkletDescription, setBookmarkletDescription] = useState<string | null>(null);

  // 对话框状态
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isSubcategoryFormOpen, setIsSubcategoryFormOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<string>("");
  const [deleteItemName, setDeleteItemName] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // 获取当前选中的分类
  const selectedCategory = localCategories.find(
    (category) => category.uuid === selectedCategoryUuid
  );

  // 获取当前选中的子分类
  const selectedSubcategory = selectedCategory?.subcategories?.find(
    (subcategory) => subcategory.uuid === selectedSubcategoryUuid
  );

  // 当选中的分类变化时，默认选中第一个子分类
  useEffect(() => {
    if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
      setSelectedSubcategoryUuid(selectedCategory.subcategories[0].uuid);
    } else {
      setSelectedSubcategoryUuid(undefined);
    }
  }, [selectedCategoryUuid, selectedCategory]);

  // 同步本地分类状态
  useEffect(() => {
    setLocalCategories(categoriesWithSubcategories);
  }, [categoriesWithSubcategories]);

  // 设置当前集合到上下文中
  useEffect(() => {
    setCurrentCollection(collection);

    // 组件卸载时清除当前集合
    return () => {
      setCurrentCollection(null);
    };
  }, [collection, setCurrentCollection]);

  // 更新全局上下文中的选择状态
  const { setSelectedCategoryUuid: setGlobalCategoryUuid, setSelectedSubcategoryUuid: setGlobalSubcategoryUuid } = useCollection();

  useEffect(() => {
    // 将当前选择的分类和子分类更新到全局上下文
    setGlobalCategoryUuid(selectedCategoryUuid);
    setGlobalSubcategoryUuid(selectedSubcategoryUuid);

    console.log("Updated global context with selection:", {
      category: selectedCategoryUuid,
      subcategory: selectedSubcategoryUuid
    });
  }, [selectedCategoryUuid, selectedSubcategoryUuid, setGlobalCategoryUuid, setGlobalSubcategoryUuid]);

  // 设置当前用户UUID
  useEffect(() => {
    // 如果是所有者，则当前用户UUID就是集合所有者的UUID
    if (isOwner && collection.user_uuid) {
      setCurrentUserUuid(collection.user_uuid);
    }
  }, [isOwner, collection.user_uuid]);

  // 处理bookmarklet参数
  useEffect(() => {
    if (!searchParams) return;

    // 检查URL参数
    const isBookmarklet = searchParams.get('bookmarklet') === 'true';
    const url = searchParams.get('url');
    const title = searchParams.get('title');
    const description = searchParams.get('description');

    // 确保用户已登录且是所有者
    if (isBookmarklet && url && title && isOwner && currentUserUuid) {
      console.log("Bookmarklet detected, opening dialog with:", { url, title, description });

      // 设置bookmarklet数据
      setBookmarkletUrl(url);
      setBookmarkletTitle(title);
      if (description) {
        setBookmarkletDescription(description);
      }

      // 确保编辑模式开启，这样才能显示添加书签对话框
      setEditMode(true);

      // 延迟一下再打开对话框，确保状态已更新
      setTimeout(() => {
        // 自动打开添加书签对话框
        setQuickAddDialogOpen(true);

        // 清除URL参数，避免刷新页面时重复打开对话框
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('bookmarklet');
        newUrl.searchParams.delete('url');
        newUrl.searchParams.delete('title');
        newUrl.searchParams.delete('description');
        window.history.replaceState({}, '', newUrl.toString());
      }, 500);
    }
  }, [searchParams, isOwner, currentUserUuid, setEditMode]);



  // 处理分类创建
  const handleAddCategory = () => {
    setSelectedItem(null);
    setFormMode("create");
    setIsCategoryFormOpen(true);
  };

  // 处理分类编辑
  const handleEditCategory = (category: any) => {
    setSelectedItem(category);
    setFormMode("edit");
    setIsCategoryFormOpen(true);
  };

  // 处理分类删除
  const handleDeleteCategory = (category: any) => {
    setSelectedItem(category);
    setDeleteItemType("category");
    setDeleteItemName(category.name);
    setIsDeleteDialogOpen(true);
  };

  // 处理子分类创建
  const handleAddSubcategory = () => {
    if (!selectedCategoryUuid) {
      toast.error(locale === 'zh' ? "请先选择一个分类" : "Please select a category first");
      return;
    }
    setSelectedItem(null);
    setFormMode("create");
    setIsSubcategoryFormOpen(true);
  };

  // 处理子分类编辑
  const handleEditSubcategory = (subcategory: any) => {
    setSelectedItem(subcategory);
    setFormMode("edit");
    setIsSubcategoryFormOpen(true);
  };

  // 处理子分类删除
  const handleDeleteSubcategory = (subcategory: any) => {
    setSelectedItem(subcategory);
    setDeleteItemType("subcategory");
    setDeleteItemName(subcategory.name);
    setIsDeleteDialogOpen(true);
  };

  // 处理书签创建
  const handleAddItem = () => {
    if (!selectedSubcategoryUuid) {
      toast.error(locale === 'zh' ? "请先选择一个子分类" : "Please select a subcategory first");
      return;
    }
    setSelectedItem(null);
    setFormMode("create");
    setIsItemFormOpen(true);
  };

  // 处理书签编辑
  const handleEditItem = (item: BookmarkItem) => {
    setSelectedItem(item);
    setFormMode("edit");
    setIsItemFormOpen(true);
  };

  // 处理书签删除
  const handleDeleteItem = (item: BookmarkItem) => {
    setSelectedItem(item);
    setDeleteItemType("item");
    setDeleteItemName(item.title);
    setIsDeleteDialogOpen(true);
  };



  // 处理保存分类
  const handleSaveCategory = async (data: any) => {
    try {
      // 调用API保存分类
      const response = await fetch("/api/bookmark/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          collection_uuid: collection.uuid
        }),
      });

      if (!response.ok) {
        throw new Error("保存分类失败");
      }

      toast.success("分类已保存");
      router.refresh();
    } catch (error) {
      toast.error("保存分类失败");
      console.error(error);
    }
  };

  // 处理保存子分类
  const handleSaveSubcategory = async (data: any) => {
    try {
      // 调用API保存子分类
      const response = await fetch("/api/bookmark/subcategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          category_uuid: data.category_uuid
        }),
      });

      if (!response.ok) {
        throw new Error("保存子分类失败");
      }

      toast.success("子分类已保存");
      router.refresh();
    } catch (error) {
      toast.error("保存子分类失败");
      console.error(error);
    }
  };

  // 处理保存书签
  const handleSaveItem = async (data: any) => {
    try {
      // 判断是创建新书签还是更新现有书签
      const isEditing = formMode === "edit" && selectedItem && selectedItem.uuid;

      // 设置请求URL和方法
      const url = isEditing
        ? `/api/bookmark/items/${selectedItem.uuid}`
        : "/api/bookmark/items";

      const method = isEditing ? "PUT" : "POST";

      // 调用API保存书签
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          url: data.url,
          description: data.description,
          subcategory_uuid: data.subcategory_uuid,
          icon_url: data.icon_url
        }),
      });

      if (!response.ok) {
        throw new Error(isEditing ? "更新书签失败" : "保存书签失败");
      }

      toast.success(isEditing ? "书签已更新" : "书签已保存");
      router.refresh();
    } catch (error) {
      toast.error(formMode === "edit" ? "更新书签失败" : "保存书签失败");
      console.error(error);
    }
  };

  // 处理确认删除
  const handleConfirmDelete = async () => {
    try {
      if (!selectedItem || !selectedItem.uuid) {
        throw new Error("无效的项目");
      }

      let endpoint = "";
      if (deleteItemType === "category") {
        endpoint = `/api/bookmark/categories/${selectedItem.uuid}`;
      } else if (deleteItemType === "subcategory") {
        endpoint = `/api/bookmark/subcategories/${selectedItem.uuid}`;
      } else if (deleteItemType === "item") {
        endpoint = `/api/bookmark/items/${selectedItem.uuid}`;
      } else {
        throw new Error("未知的项目类型");
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      toast.success(`${deleteItemType === "category" ? "分类" : deleteItemType === "subcategory" ? "子分类" : "书签"}已删除`);
      router.refresh();
    } catch (error) {
      toast.error("删除失败");
      console.error(error);
    }
  };

  // 处理分类排序
  const handleReorderCategories = async (newOrder: BookmarkCategoryWithSubcategories[]) => {
    try {
      // 准备排序数据
      const categoriesWithOrderIndex = newOrder.map((category, index) => ({
        uuid: category.uuid,
        order_index: index
      }));

      // 调用API保存排序
      const response = await fetch("/api/bookmark/categories/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories: categoriesWithOrderIndex }),
      });

      if (!response.ok) {
        throw new Error("保存排序失败");
      }

      toast.success("分类排序已保存");
      router.refresh();
    } catch (error) {
      toast.error("保存排序失败");
      console.error(error);
    }
  };

  // 处理子分类排序
  const handleReorderSubcategories = async (newOrder: BookmarkSubcategoryWithItems[]) => {
    try {
      // 准备排序数据
      const subcategoriesWithOrderIndex = newOrder.map((subcategory, index) => ({
        uuid: subcategory.uuid,
        order_index: index
      }));

      // 调用API保存排序
      const response = await fetch("/api/bookmark/subcategories/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subcategories: subcategoriesWithOrderIndex }),
      });

      if (!response.ok) {
        throw new Error("保存排序失败");
      }

      toast.success("子分类排序已保存");
      router.refresh();
    } catch (error) {
      toast.error("保存排序失败");
      console.error(error);
    }
  };

  // 处理书签排序
  const handleReorderItems = async (newOrder: BookmarkItem[]) => {
    try {
      // 准备排序数据
      const itemsWithOrderIndex = newOrder.map((item, index) => ({
        uuid: item.uuid,
        order_index: index
      }));

      // 调用API保存排序
      const response = await fetch("/api/bookmark/items/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: itemsWithOrderIndex }),
      });

      if (!response.ok) {
        throw new Error("保存排序失败");
      }

      toast.success("书签排序已保存");
      router.refresh();
    } catch (error) {
      toast.error("保存排序失败");
      console.error(error);
    }
  };

  // 处理乐观更新
  const handleOptimisticUpdate = useCallback((updatedCategories: BookmarkCategoryWithSubcategories[]) => {
    // 更新本地分类状态
    setLocalCategories(updatedCategories);

    // 如果当前选中的分类或子分类是临时项目，自动选中它
    const tempCategory = updatedCategories.find(cat => cat.is_temp);
    if (tempCategory) {
      setSelectedCategoryUuid(tempCategory.uuid);

      const tempSubcategory = tempCategory.subcategories?.find(subcat => subcat.is_temp);
      if (tempSubcategory) {
        setSelectedSubcategoryUuid(tempSubcategory.uuid);
      }
    } else {
      // 如果没有临时分类，检查当前选中的分类中是否有临时子分类
      const currentCategory = updatedCategories.find(cat => cat.uuid === selectedCategoryUuid);
      if (currentCategory) {
        const tempSubcategory = currentCategory.subcategories?.find(subcat => subcat.is_temp);
        if (tempSubcategory) {
          setSelectedSubcategoryUuid(tempSubcategory.uuid);
        }
      }
    }
  }, []);

  return (
    <div className="mx-auto w-[85%] pt-4 pb-8">
      {/* 集合头部 - 标题和相关信息已移除，操作按钮已移至顶部导航栏 */}

      {/* Bookmarklet生成器已移至顶部导航栏 */}



      {/* 分类导航 */}
      {localCategories.length > 0 ? (
        categoriesReorderEnabled ? (
          <SortableCategoriesList
            categories={localCategories}
            selectedCategoryUuid={selectedCategoryUuid}
            onReorder={handleReorderCategories}
            onCancel={() => setCategoriesReorderEnabled(false)}
          />
        ) : (
          <div className="mb-6">
            {/* 分类导航 - 占据整行 */}
            <CategoryNav
              categories={localCategories}
              selectedCategoryUuid={selectedCategoryUuid}
              onSelectCategory={setSelectedCategoryUuid}
              isOwner={isOwner}
              editMode={editMode}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>
        )
      ) : (
        <div className="text-center py-8 border rounded-lg mb-6">
          <p className="text-muted-foreground">
            暂无分类，请使用右上角的"添加书签"按钮添加书签时自动创建分类
          </p>
        </div>
      )}

      {/* 子分类排序 - 当启用时显示在顶部 */}
      {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && subcategoriesReorderEnabled && (
        <div className="mb-6">
          <SortableSubcategoriesList
            subcategories={selectedCategory.subcategories}
            selectedSubcategoryUuid={selectedSubcategoryUuid}
            onReorder={handleReorderSubcategories}
            onCancel={() => setSubcategoriesReorderEnabled(false)}
          />
        </div>
      )}

      {/* 当没有分类时，不显示两列布局 */}
      {localCategories.length === 0 ? null : (
        /* 子分类和书签的两列布局 */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mt-6">
        {/* 左侧子分类列表 */}
        <div className="md:col-span-1">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/60 shadow-sm sticky top-24">
            {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && !subcategoriesReorderEnabled ? (
                <div className="space-y-2">
                  {/* 子分类标题已移除 */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-1 w-12 bg-primary/30 rounded-full"></div>
                  </div>

                  {selectedCategory.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.uuid}
                      className={`p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-all group ${
                        subcategory.uuid === selectedSubcategoryUuid
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted/70 hover:translate-x-0.5"
                      }`}
                      onClick={() => setSelectedSubcategoryUuid(subcategory.uuid)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${subcategory.uuid === selectedSubcategoryUuid ? "bg-primary-foreground" : "bg-primary/70"}`}></div>
                        <span className="truncate font-medium text-sm">{subcategory.name}</span>
                      </div>
                      {isOwner && editMode && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSubcategory(subcategory);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubcategory(subcategory);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            ) : selectedCategory && !subcategoriesReorderEnabled ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">暂无子分类，请使用右上角的"添加书签"按钮添加书签时自动创建子分类</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">请先选择一个分类</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧书签列表 */}
        <div className="md:col-span-6">
          {selectedSubcategory ? (
            bookmarksReorderEnabled ? (
              <SortableBookmarkList
                items={selectedSubcategory.items || []}
                onReorder={handleReorderItems}
                onCancel={() => setBookmarksReorderEnabled(false)}
              />
            ) : (
              <BookmarkItemList
                items={selectedSubcategory.items || []}
                isOwner={isOwner}
                editMode={editMode}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onAdd={handleAddItem}
              />
            )
          ) : selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">请使用右上角的"添加书签"按钮添加书签，系统会自动创建子分类</p>
            </div>
          ) : selectedCategory ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">请选择一个子分类</p>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">请先选择一个分类</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* 对话框组件 */}

      <CategoryFormDialog
        open={isCategoryFormOpen}
        onOpenChange={setIsCategoryFormOpen}
        category={selectedItem}
        mode={formMode}
        collectionUuid={collection.uuid}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      <SubcategoryFormDialog
        open={isSubcategoryFormOpen}
        onOpenChange={setIsSubcategoryFormOpen}
        subcategory={selectedItem}
        mode={formMode}
        categoryUuid={selectedCategoryUuid || ""}
        onSave={handleSaveSubcategory}
        onDelete={handleDeleteSubcategory}
      />

      <ItemFormDialog
        open={isItemFormOpen}
        onOpenChange={setIsItemFormOpen}
        item={selectedItem}
        mode={formMode}
        subcategoryUuid={selectedSubcategoryUuid || ""}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemType={deleteItemType}
        itemName={deleteItemName}
        onConfirm={handleConfirmDelete}
      />

      {/* 快速添加书签对话框 - 用于处理bookmarklet请求 */}
      {isOwner && currentUserUuid && (
        <QuickAddBookmarkDialog
          collection={collection}
          categories={localCategories}
          onSuccess={() => {
            router.refresh();
          }}
          onOptimisticUpdate={handleOptimisticUpdate}
          currentUserUuid={currentUserUuid}
          open={quickAddDialogOpen}
          onOpenChange={setQuickAddDialogOpen}
          defaultValues={
            bookmarkletUrl && bookmarkletTitle
              ? {
                  url: bookmarkletUrl,
                  title: bookmarkletTitle,
                  description: bookmarkletDescription || "",
                }
              : undefined
          }
          currentSelection={{
            categoryUuid: selectedCategoryUuid,
            subcategoryUuid: selectedSubcategoryUuid
          }}
          isFromBookmarklet={!!bookmarkletUrl && !!bookmarkletTitle}
        />
      )}
    </div>
  );
}
