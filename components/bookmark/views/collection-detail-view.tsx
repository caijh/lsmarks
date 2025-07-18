"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCollection } from "@/contexts/collection-context";
import { useEditMode } from "@/contexts/edit-mode-context";
import { BookmarkCollection, BookmarkCollectionWithStats } from "@/types/bookmark/collection";
import { BookmarkCategoryWithSubcategories } from "@/types/bookmark/category";
import { BookmarkSubcategoryWithItems } from "@/types/bookmark/subcategory";
import { BookmarkItem, BookmarkItemFormData } from "@/types/bookmark/item";
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
  DeleteConfirmationDialog,
  EnhancedItemEditDialog
} from "@/components/bookmark/dialogs";
import { BookmarkletGenerator } from "@/components/bookmark/bookmarklet/generator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
import { CollectionSearch } from "@/components/search/collection-search";
import { useSearch } from "@/contexts/search-context";

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
  const { collectionSearchQuery } = useSearch();

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

  // 搜索相关状态
  const [filteredItems, setFilteredItems] = useState<BookmarkItem[]>([]);

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
  const [isEnhancedItemEditOpen, setIsEnhancedItemEditOpen] = useState(false);
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

  // 获取所有书签项目（用于搜索）
  const allItems = useMemo(() => {
    const items: BookmarkItem[] = [];
    localCategories.forEach(category => {
      category.subcategories?.forEach(subcategory => {
        if (subcategory.items) {
          items.push(...subcategory.items);
        }
      });
    });
    return items;
  }, [localCategories]);

  // 当选中的分类变化时，默认选择"全部"（不选择具体子分类）
  useEffect(() => {
    if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
      // 设置为 undefined 表示选择"全部"
      setSelectedSubcategoryUuid(undefined);
    } else {
      setSelectedSubcategoryUuid(undefined);
    }
  }, [selectedCategoryUuid, selectedCategory]);

  // 获取所有子分类的列表，用于在右侧显示所有书签
  const allSubcategoriesItems = selectedCategory?.subcategories?.flatMap(subcategory =>
    (subcategory.items || []).map(item => ({
      ...item,
      subcategory_name: subcategory.name // 添加子分类名称，用于显示
    }))
  ) || [];

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
    setIsEnhancedItemEditOpen(true);
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
      // 判断是创建新分类还是更新现有分类
      const isEditing = formMode === "edit" && selectedItem && selectedItem.uuid;

      // 设置请求URL和方法
      const url = isEditing
        ? `/api/bookmark/categories/${selectedItem.uuid}`
        : "/api/bookmark/categories";

      const method = isEditing ? "PUT" : "POST";

      // 调用API保存分类
      const response = await fetch(url, {
        method: method,
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
        throw new Error(isEditing ? "更新分类失败" : "保存分类失败");
      }

      toast.success(isEditing ? "分类已更新" : "分类已保存");
      router.refresh();
    } catch (error) {
      toast.error(formMode === "edit" ? "更新分类失败" : "保存分类失败");
      console.error(error);
    }
  };

  // 处理保存子分类
  const handleSaveSubcategory = async (data: any) => {
    try {
      // 判断是创建新子分类还是更新现有子分类
      const isEditing = formMode === "edit" && selectedItem && selectedItem.uuid;

      // 设置请求URL和方法
      const url = isEditing
        ? `/api/bookmark/subcategories/${selectedItem.uuid}`
        : "/api/bookmark/subcategories";

      const method = isEditing ? "PUT" : "POST";

      // 调用API保存子分类
      const response = await fetch(url, {
        method: method,
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
        throw new Error(isEditing ? "更新子分类失败" : "保存子分类失败");
      }

      toast.success(isEditing ? "子分类已更新" : "子分类已保存");
      router.refresh();
    } catch (error) {
      toast.error(formMode === "edit" ? "更新子分类失败" : "保存子分类失败");
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

  // 处理增强版书签保存（支持分类迁移）
  const handleEnhancedSaveItem = async (data: BookmarkItemFormData & { category_uuid: string }) => {
    try {
      if (!selectedItem || !selectedItem.uuid) {
        throw new Error("无效的书签项目");
      }

      // 调用API更新书签
      const response = await fetch(`/api/bookmark/items/${selectedItem.uuid}`, {
        method: "PUT",
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
        throw new Error("更新书签失败");
      }

      toast.success("书签已更新");
      router.refresh();
    } catch (error) {
      toast.error("更新书签失败");
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
      {/* 美化的集合头部 */}
      <motion.div
        className="mb-8 relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-xl"></div>

        {/* 内容区域 */}
        <div className="relative bg-card/80 backdrop-blur-md border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* 左侧：集合信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                  <Bookmark className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    {collection.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>{username}</span>
                    <span>•</span>
                    {collection.is_public ? (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        <span>公开</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5" />
                        <span>私有</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {collection.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {collection.description}
                </p>
              )}
            </div>

            {/* 右侧：统计信息 */}
            <div className="flex-shrink-0">
              <div className="flex gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-primary">
                    {localCategories.length}
                  </div>
                  <div className="text-xs text-muted-foreground">分类</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-primary">
                    {localCategories.reduce((total, cat) =>
                      total + (cat.subcategories?.reduce((subTotal, sub) =>
                        subTotal + (sub.items?.length || 0), 0) || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">书签</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-primary">
                    {new Date(collection.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">创建</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>



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
        <div className="text-center py-12 border border-dashed border-border/50 rounded-xl mb-8 bg-muted/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
              <Bookmark className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground max-w-md">
              暂无分类，请使用右上角的"添加书签"按钮添加书签时自动创建分类
            </p>
          </div>
        </div>
      )}

      {/* 集合内搜索 */}
      {localCategories.length > 0 && allItems.length > 0 && (
        <div className="mb-6">
          <CollectionSearch
            items={allItems}
            categories={localCategories}
            onFilteredResults={setFilteredItems}
          />
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
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8 mt-8">
        {/* 左侧子分类列表 */}
        <div className="md:col-span-1">
          <div className="bg-background/65 backdrop-blur-sm rounded-lg p-4 border border-border/60 shadow-sm sticky top-24">
            {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && !subcategoriesReorderEnabled ? (
                <div className="space-y-2">
                  {/* 子分类标题和全部选项 */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-1 w-12 bg-primary/30 rounded-full"></div>
                  </div>

                  {/* 添加"全部"选项 */}
                  <div
                    className={`p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-all group ${
                      selectedSubcategoryUuid === undefined
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted/65 backdrop-blur-sm hover:translate-x-0.5"
                    }`}
                    onClick={() => setSelectedSubcategoryUuid(undefined)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedSubcategoryUuid === undefined ? "bg-primary-foreground" : "bg-primary/70"}`}></div>
                      <span className="truncate font-medium text-sm">全部</span>
                    </div>
                  </div>

                  {selectedCategory.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.uuid}
                      className={`p-2.5 rounded-md cursor-pointer flex justify-between items-center transition-all group ${
                        subcategory.uuid === selectedSubcategoryUuid
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted/65 backdrop-blur-sm hover:translate-x-0.5"
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
          {/* 如果有搜索结果，显示搜索结果 */}
          {collectionSearchQuery && filteredItems.length >= 0 ? (
            <div>
              <div className="mb-5 pb-2 border-b">
                <h3 className="text-lg font-medium flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                  搜索结果
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  找到 {filteredItems.length} 个匹配的书签
                </p>
              </div>

              {filteredItems.length > 0 ? (
                <BookmarkItemList
                  items={filteredItems}
                  isOwner={isOwner}
                  editMode={editMode}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onAdd={handleAddItem}
                />
              ) : (
                <div className="text-center py-12 border border-dashed border-border/50 rounded-xl bg-muted/20 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                      <Bookmark className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      未找到匹配的书签
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : selectedSubcategory ? (
            // 显示选中的子分类的书签
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
          ) : selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && !selectedSubcategoryUuid ? (
            // 显示所有子分类的书签（当选择"全部"时）
            <div>
              <div className="mb-5 pb-2 border-b">
                <h3 className="text-lg font-medium flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                  所有书签
                </h3>
                <p className="text-sm text-muted-foreground mt-1">显示所有子分类的书签，每行显示5列</p>
              </div>

              {allSubcategoriesItems.length > 0 ? (
                <div className="space-y-8">
                  {selectedCategory.subcategories.map(subcategory => {
                    // 只显示有书签的子分类
                    if (!subcategory.items || subcategory.items.length === 0) return null;

                    return (
                      <div key={subcategory.uuid} className="border-l-2 border-primary/40 pl-4 pb-6 mb-2">
                        <h4 className="text-md font-medium mb-3 flex items-center bg-primary/10 p-2 rounded-md">
                          <div className="w-3 h-3 rounded-full bg-primary/70 mr-2"></div>
                          {subcategory.name}
                        </h4>
                        <BookmarkItemList
                          items={subcategory.items || []}
                          isOwner={isOwner}
                          editMode={editMode}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteItem}
                          onAdd={() => {
                            // 设置当前子分类并打开添加对话框
                            setSelectedSubcategoryUuid(subcategory.uuid);
                            setTimeout(() => handleAddItem(), 100);
                          }}
                          compact={true} // 紧凑模式
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">暂无书签，请添加书签</p>
                </div>
              )}
            </div>
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

      {/* 增强版书签编辑对话框 - 支持分类迁移 */}
      {selectedItem && (
        <EnhancedItemEditDialog
          open={isEnhancedItemEditOpen}
          onOpenChange={setIsEnhancedItemEditOpen}
          item={selectedItem}
          categories={localCategories}
          currentCategoryUuid={selectedCategoryUuid || ""}
          onSave={handleEnhancedSaveItem}
          onDelete={handleDeleteItem}
        />
      )}

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
