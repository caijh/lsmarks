"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearch } from "@/contexts/search-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, X, Filter, Calendar, Tag, Globe } from "@/components/ui/icons";
import { BookmarkItem } from "@/types/bookmark/item";
import { BookmarkCategoryWithSubcategories } from "@/types/bookmark/category";

interface CollectionSearchProps {
  items: BookmarkItem[];
  categories: BookmarkCategoryWithSubcategories[];
  onFilteredResults: (filteredItems: BookmarkItem[]) => void;
  className?: string;
}

interface LocalFilters {
  category?: string;
  subcategory?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  domain?: string;
}

export function CollectionSearch({
  items,
  categories,
  onFilteredResults,
  className = ""
}: CollectionSearchProps) {
  const { collectionSearchQuery, setCollectionSearchQuery } = useSearch();
  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // 获取所有域名用于筛选
  const domains = useMemo(() => {
    const domainSet = new Set<string>();
    items.forEach(item => {
      try {
        const url = new URL(item.url);
        domainSet.add(url.hostname);
      } catch (e) {
        // 忽略无效URL
      }
    });
    return Array.from(domainSet).sort();
  }, [items]);

  // 搜索和筛选逻辑
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // 文本搜索
    if (collectionSearchQuery.trim()) {
      const query = collectionSearchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descriptionMatch = item.description?.toLowerCase().includes(query);
        const urlMatch = item.url.toLowerCase().includes(query);
        
        // 提取域名进行搜索
        let domainMatch = false;
        try {
          const url = new URL(item.url);
          domainMatch = url.hostname.toLowerCase().includes(query);
        } catch (e) {
          // 忽略无效URL
        }
        
        return titleMatch || descriptionMatch || urlMatch || domainMatch;
      });
    }

    // 分类筛选
    if (localFilters.category) {
      const category = categories.find(cat => cat.uuid === localFilters.category);
      if (category) {
        const subcategoryUuids = category.subcategories?.map(sub => sub.uuid) || [];
        filtered = filtered.filter(item => 
          subcategoryUuids.includes(item.subcategory_uuid)
        );
      }
    }

    // 子分类筛选
    if (localFilters.subcategory) {
      filtered = filtered.filter(item => 
        item.subcategory_uuid === localFilters.subcategory
      );
    }

    // 时间范围筛选
    if (localFilters.dateRange && localFilters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (localFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(item => 
        new Date(item.created_at) >= filterDate
      );
    }

    // 域名筛选
    if (localFilters.domain) {
      filtered = filtered.filter(item => {
        try {
          const url = new URL(item.url);
          return url.hostname === localFilters.domain;
        } catch (e) {
          return false;
        }
      });
    }

    return filtered;
  }, [items, collectionSearchQuery, localFilters, categories]);

  // 通知父组件筛选结果
  useEffect(() => {
    onFilteredResults(filteredItems);
  }, [filteredItems, onFilteredResults]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setCollectionSearchQuery("");
    setLocalFilters({ dateRange: 'all' });
    setShowFilters(false);
  }, [setCollectionSearchQuery]);

  // 获取活跃筛选器数量
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.subcategory) count++;
    if (localFilters.dateRange && localFilters.dateRange !== 'all') count++;
    if (localFilters.domain) count++;
    return count;
  }, [localFilters]);

  // 获取筛选器标签
  const getFilterLabel = (key: keyof LocalFilters, value: string) => {
    switch (key) {
      case 'category':
        const category = categories.find(cat => cat.uuid === value);
        return category?.name || value;
      case 'subcategory':
        const subcategory = categories
          .flatMap(cat => cat.subcategories || [])
          .find(sub => sub.uuid === value);
        return subcategory?.name || value;
      case 'dateRange':
        const dateLabels = {
          today: '今天',
          week: '本周',
          month: '本月',
          year: '本年'
        };
        return dateLabels[value as keyof typeof dateLabels] || value;
      case 'domain':
        return value;
      default:
        return value;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索书签标题、描述、网址..."
          value={collectionSearchQuery}
          onChange={(e) => setCollectionSearchQuery(e.target.value)}
          className="pl-9 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* 筛选按钮 */}
          <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Filter className="h-3 w-3" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>筛选选项</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* 分类筛选 */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                按分类筛选
              </DropdownMenuLabel>
              {categories.map(category => (
                <DropdownMenuItem
                  key={category.uuid}
                  onClick={() => setLocalFilters(prev => ({
                    ...prev,
                    category: prev.category === category.uuid ? undefined : category.uuid,
                    subcategory: undefined // 清除子分类选择
                  }))}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-3 w-3" />
                  <span className="flex-1">{category.name}</span>
                  {localFilters.category === category.uuid && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* 时间筛选 */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                按时间筛选
              </DropdownMenuLabel>
              {[
                { value: 'all', label: '全部时间' },
                { value: 'today', label: '今天' },
                { value: 'week', label: '本周' },
                { value: 'month', label: '本月' },
                { value: 'year', label: '本年' }
              ].map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setLocalFilters(prev => ({
                    ...prev,
                    dateRange: option.value as LocalFilters['dateRange']
                  }))}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-3 w-3" />
                  <span className="flex-1">{option.label}</span>
                  {localFilters.dateRange === option.value && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* 域名筛选 */}
              {domains.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    按网站筛选
                  </DropdownMenuLabel>
                  {domains.slice(0, 10).map(domain => (
                    <DropdownMenuItem
                      key={domain}
                      onClick={() => setLocalFilters(prev => ({
                        ...prev,
                        domain: prev.domain === domain ? undefined : domain
                      }))}
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-3 w-3" />
                      <span className="flex-1 truncate">{domain}</span>
                      {localFilters.domain === domain && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* 清除按钮 */}
          {(collectionSearchQuery || activeFiltersCount > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-7 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* 活跃筛选器标签 */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(localFilters).map(([key, value]) => {
            if (!value || (key === 'dateRange' && value === 'all')) return null;
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                {getFilterLabel(key as keyof LocalFilters, value)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => setLocalFilters(prev => ({
                    ...prev,
                    [key]: key === 'dateRange' ? 'all' : undefined
                  }))}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* 搜索结果统计 */}
      {(collectionSearchQuery || activeFiltersCount > 0) && (
        <div className="text-sm text-muted-foreground">
          找到 {filteredItems.length} 个结果
          {items.length !== filteredItems.length && ` (共 ${items.length} 个书签)`}
        </div>
      )}
    </div>
  );
}
