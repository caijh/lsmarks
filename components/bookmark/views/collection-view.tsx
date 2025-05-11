"use client";

import { useState, useEffect } from "react";
import { BookmarkCollectionWithStats } from "@/types/bookmark/collection";
import { getBookmarkCategoriesByCollection } from "@/services/bookmark/category";
import { getBookmarkItemsByCollection } from "@/services/bookmark/item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// 移除未使用的导入
import { BookmarkCategory } from "@/types/bookmark/category";
import { BookmarkItem } from "@/types/bookmark/item";
import { Bookmark, ExternalLink, Folder, Globe, Info, User } from "@/components/ui/icons";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface CollectionViewProps {
  collection: BookmarkCollectionWithStats;
  username: string;
}

export function CollectionView({ collection, username }: CollectionViewProps) {
  const [categories, setCategories] = useState<BookmarkCategory[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 获取分类
        const categoriesData = await getBookmarkCategoriesByCollection(collection.uuid);
        setCategories(categoriesData);

        // 获取书签
        const bookmarksData = await getBookmarkItemsByCollection(collection.uuid);
        setBookmarks(bookmarksData);

        // 设置默认选中的分类
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].uuid);
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [collection.uuid]);

  // 根据分类过滤书签
  const filteredBookmarks = selectedCategory
    ? bookmarks.filter(bookmark => bookmark.category_uuid === selectedCategory)
    : bookmarks;

  return (
    <div className="container py-8">
      {/* 集合信息 */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{collection.name}</h1>
            {collection.description && (
              <p className="text-muted-foreground">{collection.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/collections/${username}`}>
                <User className="mr-2 h-4 w-4" />
                {username}的其他集合
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Folder className="h-4 w-4" />
            <span>{collection.category_count || 0} 个分类</span>
          </div>
          {bookmarks.length > 0 && (
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>{bookmarks.length} 个书签</span>
            </div>
          )}
          {collection.created_at && (
            <div className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>
                创建于 {formatDistanceToNow(new Date(collection.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-3">
            <CardHeader>
              <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 分类列表 */}
          <Card className="md:col-span-1 bg-card/70 backdrop-blur-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">分类</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length > 0 ? (
                <div className="space-y-1">
                  {categories.map(category => (
                    <Button
                      key={category.uuid}
                      variant={selectedCategory === category.uuid ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.uuid)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      {category.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">暂无分类</p>
              )}
            </CardContent>
          </Card>

          {/* 书签列表 */}
          <Card className="md:col-span-3 bg-card/70 backdrop-blur-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">书签</CardTitle>
              {selectedCategory && (
                <CardDescription>
                  {categories.find(c => c.uuid === selectedCategory)?.name || "所有书签"}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {filteredBookmarks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBookmarks.map(bookmark => (
                    <Card key={bookmark.uuid} className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/30 transition-colors">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base truncate">
                          <Link
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <Globe className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{bookmark.title}</span>
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        {bookmark.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {bookmark.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground truncate max-w-[70%]">
                            {new URL(bookmark.url).hostname}
                          </span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                            <Link href={bookmark.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">暂无书签</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
