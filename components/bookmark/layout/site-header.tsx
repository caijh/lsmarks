"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, User, Droplets, LogOut, BookmarkPlus, PlusCircle, MoveVertical } from "@/components/ui/icons";
import { signOut } from "next-auth/react";
import { useCollection } from "@/contexts/collection-context";
import { useEditMode } from "@/contexts/edit-mode-context";
import React, { useEffect, useState } from "react";
import { EditModeToggle } from "@/components/bookmark/shared/edit-mode-toggle";
import { QuickAddBookmarkDialog } from "@/components/bookmark/dialogs/quick-add-bookmark-dialog";
import { BookmarkletGenerator } from "@/components/bookmark/bookmarklet/generator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/bookmark/theme/theme-switcher";
import { Logo } from "@/components/ui/logo";

interface SiteHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    uuid?: string | null;
    username?: string | null;
  } | null;
}

// 包装组件，用于从CollectionContext获取当前选择的大分类和子分类
function HeaderQuickAddBookmarkDialog(props: React.ComponentProps<typeof QuickAddBookmarkDialog>) {
  const { selectedCategoryUuid, selectedSubcategoryUuid } = useCollection();

  console.log("HeaderQuickAddBookmarkDialog - Current selection:", {
    categoryUuid: selectedCategoryUuid,
    subcategoryUuid: selectedSubcategoryUuid
  });

  // 检查categories数据是否包含子分类
  useEffect(() => {
    if (props.categories && props.categories.length > 0) {
      console.log("HeaderQuickAddBookmarkDialog - Categories data:", props.categories);

      // 检查是否有子分类数据
      let hasSubcategories = false;
      props.categories.forEach(category => {
        if (category.subcategories && category.subcategories.length > 0) {
          hasSubcategories = true;
        }
      });

      if (!hasSubcategories) {
        console.warn("HeaderQuickAddBookmarkDialog - No subcategories found in categories data!");
      }
    }
  }, [props.categories]);

  return (
    <QuickAddBookmarkDialog
      {...props}
      currentSelection={{
        categoryUuid: selectedCategoryUuid,
        subcategoryUuid: selectedSubcategoryUuid
      }}
    />
  );
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const pathname = usePathname() || "";
  const { currentCollection } = useCollection();
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

  // 状态
  const [showBookmarklet, setShowBookmarklet] = useState(false);
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // 判断是否在集合详情页面
  const isCollectionPage = pathname?.includes('/collections/') && pathname?.split('/').length > 3;

  // 当页面变化时重置编辑模式和其他状态
  useEffect(() => {
    setEditMode(false);
    setShowBookmarklet(false);
    setCategoriesReorderEnabled(false);
    setSubcategoriesReorderEnabled(false);
    setBookmarksReorderEnabled(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 当在集合页面且有集合信息时，通过API获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      if (isCollectionPage && currentCollection?.uuid) {
        try {
          console.log("Fetching categories for collection:", currentCollection.uuid);

          // 使用现有API路由获取分类数据
          const categoriesResponse = await fetch(`/api/bookmark/collections/${currentCollection.uuid}/categories`);

          if (!categoriesResponse.ok) {
            console.error("Categories API request failed with status:", categoriesResponse.status);
            setCategories([]);
            return;
          }

          const categoriesData = await categoriesResponse.json();
          if (!Array.isArray(categoriesData)) {
            console.error("Invalid categories data format received:", categoriesData);
            setCategories([]);
            return;
          }

          console.log("Fetched categories:", categoriesData);

          // 为每个分类获取子分类数据
          const categoriesWithSubcategories = await Promise.all(
            categoriesData.map(async (category) => {
              try {
                // 使用现有API路由获取子分类数据
                const subcategoriesResponse = await fetch(`/api/bookmark/subcategories?category_uuid=${category.uuid}`);

                if (subcategoriesResponse.ok) {
                  const subcategoriesData = await subcategoriesResponse.json();
                  if (Array.isArray(subcategoriesData)) {
                    console.log(`Category ${category.name} has ${subcategoriesData.length} subcategories`);
                    return {
                      ...category,
                      subcategories: subcategoriesData
                    };
                  }
                }

                // 如果获取子分类失败，返回带有空子分类数组的分类
                return {
                  ...category,
                  subcategories: []
                };
              } catch (error) {
                console.error(`Error fetching subcategories for category ${category.uuid}:`, error);
                return {
                  ...category,
                  subcategories: []
                };
              }
            })
          );

          // 检查数据结构
          let hasSubcategories = false;
          categoriesWithSubcategories.forEach(category => {
            if (category.subcategories && category.subcategories.length > 0) {
              hasSubcategories = true;
            }
          });

          if (!hasSubcategories) {
            console.warn("No subcategories found in any category!");
          }

          setCategories(categoriesWithSubcategories);
        } catch (error) {
          console.error("获取分类数据失败:", error);
          // 确保在出错时至少有一个空数组
          setCategories([]);
        }
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCollection?.uuid, isCollectionPage]);

  return (
    <header className="sticky top-0 z-40 w-full border-b glass-navbar backdrop-blur-sm shadow-sm">
      {/* 导航栏装饰元素 - 简化版 */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent -z-10"></div>
      <div className="absolute inset-0 bg-gradient-primary-radial opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      <div className="container flex h-12 sm:h-14 md:h-16 items-center px-2 sm:px-4 justify-between">
        <div className="flex gap-1 sm:gap-4 md:gap-6 items-center overflow-hidden min-w-0 flex-1">
          {isCollectionPage && currentCollection ? (
            <>
              {/* 在集合页面显示Logo和集合名称 */}
              <Logo showText={false} className="flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base md:text-lg font-medium truncate text-foreground/90">
                  {currentCollection.name}
                </h1>
              </div>
            </>
          ) : (
            <>
              {/* 在其他页面显示正常的Logo */}
              <Logo showText={false} className="sm:hidden flex-shrink-0" />
              <Logo className="hidden sm:flex flex-shrink-0" />
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
          {/* 编辑模式切换按钮和工具按钮 - 只在集合页面显示且用户已登录 */}
          {isCollectionPage && currentCollection && user && (
            <>
              {/* 编辑模式下的工具按钮 */}
              {editMode && (
                <div className="flex items-center gap-0.5 sm:gap-1 bg-background/30 backdrop-blur-sm rounded-full px-1 sm:px-2 py-0.5 sm:py-1 border border-border/30 shadow-sm">
                  {/* 添加书签按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                    onClick={() => setQuickAddDialogOpen(true)}
                    title="添加书签"
                  >
                    <BookmarkPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  {/* 书签小工具按钮 - 在小屏幕上隐藏 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hidden xs:flex"
                    onClick={() => setShowBookmarklet(true)}
                    title="书签小工具"
                  >
                    <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  {/* 排序按钮组 - 在小屏幕上合并显示 */}
                  <div className="hidden sm:flex items-center gap-0.5">
                    {/* 排序分类按钮 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 sm:h-7 sm:w-7 rounded-full",
                        categoriesReorderEnabled && "bg-primary/20 text-primary"
                      )}
                      onClick={() => {
                        setCategoriesReorderEnabled(!categoriesReorderEnabled);
                        setSubcategoriesReorderEnabled(false);
                        setBookmarksReorderEnabled(false);
                      }}
                      title="排序分类"
                    >
                      <MoveVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>

                    {/* 排序子分类按钮 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 sm:h-7 sm:w-7 rounded-full",
                        subcategoriesReorderEnabled && "bg-primary/20 text-primary"
                      )}
                      onClick={() => {
                        setSubcategoriesReorderEnabled(!subcategoriesReorderEnabled);
                        setCategoriesReorderEnabled(false);
                        setBookmarksReorderEnabled(false);
                      }}
                      title="排序子分类"
                    >
                      <MoveVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>

                    {/* 排序书签按钮 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 sm:h-7 sm:w-7 rounded-full",
                        bookmarksReorderEnabled && "bg-primary/20 text-primary"
                      )}
                      onClick={() => {
                        setBookmarksReorderEnabled(!bookmarksReorderEnabled);
                        setCategoriesReorderEnabled(false);
                        setSubcategoriesReorderEnabled(false);
                      }}
                      title="排序书签"
                    >
                      <MoveVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  {/* 移动端排序菜单按钮 */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          title="排序选项"
                        >
                          <MoveVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setCategoriesReorderEnabled(!categoriesReorderEnabled);
                            setSubcategoriesReorderEnabled(false);
                            setBookmarksReorderEnabled(false);
                          }}
                          className={categoriesReorderEnabled ? "bg-primary/10" : ""}
                        >
                          排序分类
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSubcategoriesReorderEnabled(!subcategoriesReorderEnabled);
                            setCategoriesReorderEnabled(false);
                            setBookmarksReorderEnabled(false);
                          }}
                          className={subcategoriesReorderEnabled ? "bg-primary/10" : ""}
                        >
                          排序子分类
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setBookmarksReorderEnabled(!bookmarksReorderEnabled);
                            setCategoriesReorderEnabled(false);
                            setSubcategoriesReorderEnabled(false);
                          }}
                          className={bookmarksReorderEnabled ? "bg-primary/10" : ""}
                        >
                          排序书签
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}

              {/* 编辑模式切换按钮 */}
              <div className="flex-shrink-0">
                <EditModeToggle
                  isOwner={true}
                  onChange={setEditMode}
                  value={editMode}
                />
              </div>
            </>
          )}

          {/* 主题切换按钮 */}
          <div className="flex items-center bg-background/30 backdrop-blur-sm rounded-full px-1 sm:px-2 py-0.5 sm:py-1 border border-border/30 shadow-sm flex-shrink-0">
            <ThemeSwitcher />
          </div>

          {/* 添加书签对话框 - 只在用户登录时显示 */}
          {quickAddDialogOpen && currentCollection && user && (
            <HeaderQuickAddBookmarkDialog
              collection={currentCollection}
              categories={categories || []}
              open={quickAddDialogOpen}
              onOpenChange={setQuickAddDialogOpen}
              currentUserUuid={user?.uuid || ""}
              isFromBookmarklet={false}
            />
          )}

          {/* 书签小工具对话框 - 只在用户登录时显示 */}
          {showBookmarklet && currentCollection && user && (
            <BookmarkletGenerator
              collection={currentCollection}
              open={showBookmarklet}
              onOpenChange={setShowBookmarklet}
            />
          )}

          {/* 用户按钮或登录按钮 */}
          {user ? (
            <div className="flex items-center flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 p-1 sm:p-1.5 h-7 w-7 sm:h-8 sm:w-8 min-w-0"
                  >
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-center truncate px-2">
                    <div className="text-sm font-medium">
                      {user.name || user.username || user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/my-collections" className="w-full cursor-pointer">
                      <Bookmark className="mr-2 h-4 w-4" />
                      我的集合
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      // 清理本地存储缓存
                      localStorage.clear();
                      // 刷新页面
                      window.location.reload();
                    }}
                    className="cursor-pointer"
                  >
                    <Droplets className="mr-2 h-4 w-4" />
                    清理缓存
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      // 退出登录
                      signOut({ callbackUrl: '/' });
                    }}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/auth/signin" className="flex-shrink-0">
              <Button
                size="sm"
                className="rounded-full shadow-sm hover:shadow-md transition-all duration-300 text-xs sm:text-sm h-7 sm:h-8 px-3 sm:px-4 min-w-0"
              >
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
