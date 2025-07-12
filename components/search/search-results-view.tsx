"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "@/contexts/search-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Bookmark, 
  Folder, 
  Tag, 
  ExternalLink, 
  Calendar,
  Filter,
  ArrowLeft,
  Loader2
} from "@/components/ui/icons";
import { motion } from "framer-motion";

interface SearchResultsViewProps {
  initialParams: {
    q?: string;
    type?: string;
    date?: string;
    collection?: string;
    category?: string;
    page?: string;
  };
}

export function SearchResultsView({ initialParams }: SearchResultsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    query,
    setQuery,
    results,
    isSearching,
    filters,
    setFilters,
    performSearch
  } = useSearch();

  const [localQuery, setLocalQuery] = useState(initialParams.q || "");
  const [currentPage, setCurrentPage] = useState(parseInt(initialParams.page || "1"));

  // 初始化搜索
  useEffect(() => {
    if (initialParams.q) {
      setQuery(initialParams.q);
      setFilters({
        type: (initialParams.type as any) || 'all',
        dateRange: (initialParams.date as any) || 'all'
      });
      performSearch(initialParams.q, {
        type: (initialParams.type as any) || 'all',
        dateRange: (initialParams.date as any) || 'all'
      });
    }
  }, [initialParams, setQuery, setFilters, performSearch]);

  // 处理搜索
  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      setQuery(searchQuery);
      performSearch(searchQuery, filters);
      
      // 更新URL
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (filters.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters.dateRange && filters.dateRange !== 'all') params.set('date', filters.dateRange);
      
      router.push(`/search?${params.toString()}`);
    }
  }, [filters, setQuery, performSearch, router]);

  // 处理筛选器变化
  const handleFilterChange = useCallback((key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (query) {
      performSearch(query, newFilters);
      
      // 更新URL
      const params = new URLSearchParams();
      params.set('q', query);
      if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type);
      if (newFilters.dateRange && newFilters.dateRange !== 'all') params.set('date', newFilters.dateRange);
      
      router.push(`/search?${params.toString()}`);
    }
  }, [filters, setFilters, query, performSearch, router]);

  // 获取结果图标
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'bookmark':
        return <Bookmark className="h-5 w-5 text-blue-500" />;
      case 'collection':
        return <Folder className="h-5 w-5 text-green-500" />;
      case 'category':
        return <Tag className="h-5 w-5 text-purple-500" />;
      default:
        return <Search className="h-5 w-5" />;
    }
  };

  // 获取结果类型标签
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bookmark':
        return { label: '书签', color: 'bg-blue-100 text-blue-800' };
      case 'collection':
        return { label: '集合', color: 'bg-green-100 text-green-800' };
      case 'category':
        return { label: '分类', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: '', color: '' };
    }
  };

  // 处理结果点击
  const handleResultClick = (result: any) => {
    if (result.type === 'bookmark' && result.url) {
      window.open(result.url, '_blank');
    } else if (result.type === 'collection' && result.username && result.slug) {
      router.push(`/collections/${result.username}/${result.slug}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 className="text-2xl font-bold">搜索结果</h1>
      </div>

      {/* 搜索框和筛选器 */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* 搜索输入框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索书签、集合、分类..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(localQuery);
                }
              }}
              className="pl-9"
            />
            <Button
              onClick={() => handleSearch(localQuery)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
              size="sm"
            >
              搜索
            </Button>
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">筛选：</span>
            </div>
            
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="bookmark">书签</SelectItem>
                <SelectItem value="collection">集合</SelectItem>
                <SelectItem value="category">分类</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.dateRange || 'all'}
              onValueChange={(value) => handleFilterChange('dateRange', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="week">本周</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="year">本年</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      <div className="space-y-4">
        {/* 结果统计 */}
        {query && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  搜索中...
                </span>
              ) : (
                `找到 ${results.length} 个关于 "${query}" 的结果`
              )}
            </p>
          </div>
        )}

        {/* 结果列表 */}
        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result, index) => {
              const typeInfo = getTypeLabel(result.type);
              
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className="hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(result.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{result.title}</h3>
                            <Badge className={`text-xs ${typeInfo.color}`}>
                              {typeInfo.label}
                            </Badge>
                            {result.type === 'bookmark' && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          
                          {result.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {result.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {result.collection_name && (
                              <span>集合：{result.collection_name}</span>
                            )}
                            {result.category_name && (
                              <span>分类：{result.category_name}</span>
                            )}
                            {result.username && (
                              <span>作者：{result.username}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(result.created_at).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : query && !isSearching ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">未找到相关结果</h3>
              <p className="text-muted-foreground mb-4">
                尝试使用不同的关键词或调整筛选条件
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setLocalQuery("");
                  setQuery("");
                  router.push("/search");
                }}
              >
                清除搜索
              </Button>
            </CardContent>
          </Card>
        ) : !query ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">开始搜索</h3>
              <p className="text-muted-foreground">
                输入关键词搜索书签、集合和分类
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
