"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCollectionWithStats } from "@/types/bookmark/collection";
import { BookmarkCategory } from "@/types/bookmark/category";
import { BookmarkItem } from "@/types/bookmark/item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Bookmark, ExternalLink, Folder, Globe, Info, User, ArrowLeft } from "@/components/ui/icons";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface QueryCollectionDetailViewProps {
  collectionUuid: string;
  username: string;
}

export function QueryCollectionDetailView({
  collectionUuid,
  username,
  // 移除locale参数
}: QueryCollectionDetailViewProps) {
  const router = useRouter();
  const [collection, setCollection] = useState<BookmarkCollectionWithStats | null>(null);
  const [categories, setCategories] = useState<BookmarkCategory[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollectionData() {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching collection data for UUID:", collectionUuid);

        // 获取集合详情
        const collectionResponse = await fetch(`/api/bookmark/collections/${collectionUuid}`);
        if (!collectionResponse.ok) {
          console.error("Failed to fetch collection:", await collectionResponse.text());
          throw new Error("获取集合信息失败");
        }
        const collectionData = await collectionResponse.json();
        console.log("Collection data:", collectionData);
        setCollection(collectionData);

        try {
          // 获取分类 - 使用常规分类API作为备选
          console.log("Fetching categories for collection:", collectionUuid);
          let categoriesData = [];

          try {
            // 使用统一的API端点
            const categoriesResponse = await fetch(`/api/bookmark/collections/${collectionUuid}/categories`);
            if (!categoriesResponse.ok) {
              console.error("Failed to fetch categories:", await categoriesResponse.text());
              throw new Error("获取分类信息失败");
            }
            categoriesData = await categoriesResponse.json();
            console.log("Categories data:", categoriesData);
          } catch (categoryError) {
            console.error("Error fetching categories:", categoryError);
            throw new Error("获取分类信息失败");
          }

          setCategories(categoriesData);

          // 设置默认选中的分类
          if (categoriesData.length > 0) {
            setSelectedCategory(categoriesData[0].uuid);
          }
        } catch (categoryError) {
          console.error("Error handling categories:", categoryError);
          // 继续执行，不要中断整个流程
        }

        try {
          // 获取书签 - 使用备选方案
          console.log("Fetching bookmarks for collection:", collectionUuid);
          let bookmarksData = [];

          try {
            // 首先尝试新的API端点
            const bookmarksResponse = await fetch(`/api/bookmark/collections/${collectionUuid}/bookmarks`);
            if (bookmarksResponse.ok) {
              bookmarksData = await bookmarksResponse.json();
              console.log("Bookmarks data from new endpoint:", bookmarksData);
            } else {
              console.warn("New bookmarks endpoint failed, using empty array");
              bookmarksData = [];
            }
          } catch (bookmarkError) {
            console.error("Error fetching bookmarks:", bookmarkError);
            bookmarksData = [];
          }

          setBookmarks(bookmarksData);
        } catch (bookmarkError) {
          console.error("Error handling bookmarks:", bookmarkError);
          // 继续执行，不要中断整个流程
        }
      } catch (err) {
        console.error("Error fetching collection data:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchCollectionData();
  }, [collectionUuid]);

  // 根据分类过滤书签
  const filteredBookmarks = selectedCategory
    ? bookmarks.filter(bookmark => bookmark.category_uuid === selectedCategory)
    : bookmarks;

  if (loading) {
    return <CollectionDetailSkeleton />;
  }

  if (error || !collection) {
    return (
      <div className="container py-8">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            出错了
          </h2>
          <p className="text-destructive/80">
            {error || "无法加载集合信息"}
          </p>
          <div className="mt-4 p-4 bg-muted/50 rounded text-xs font-mono overflow-auto">
            <p>Collection UUID: {collectionUuid}</p>
            <p>Username: {username}</p>
            <p>Error: {error}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>
    );
  }

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
                {`${username}的其他集合`}
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
                创建于
                {formatDistanceToNow(new Date(collection.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
          )}
        </div>
      </div>

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
              <p className="text-muted-foreground text-sm">
                暂无分类
              </p>
            )}
          </CardContent>
        </Card>

        {/* 书签列表 */}
        <Card className="md:col-span-3 bg-card/70 backdrop-blur-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">书签</CardTitle>
            {selectedCategory && (
              <CardDescription>
                {categories.find(c => c.uuid === selectedCategory)?.name || '所有书签'}
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
              <p className="text-muted-foreground text-sm">
                暂无书签
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 集合详情骨架屏
function CollectionDetailSkeleton() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl mb-4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i}>
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-5 w-full" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex justify-between items-center mt-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
