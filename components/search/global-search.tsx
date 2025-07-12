"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/contexts/search-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, X, Bookmark, Folder, Tag, ExternalLink } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalSearchProps {
  trigger?: React.ReactNode;
}

export function GlobalSearch({ trigger }: GlobalSearchProps) {
  const router = useRouter();
  const {
    query,
    setQuery,
    results,
    isSearching,
    searchHistory,
    clearHistory,
    performSearch,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen
  } = useSearch();

  const [localQuery, setLocalQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 防抖搜索
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      }
    }, 300);
  }, [performSearch]);

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setLocalQuery(value);
    setQuery(value);
    debouncedSearch(value);
  };

  // 处理搜索项点击
  const handleResultClick = (result: any) => {
    setIsGlobalSearchOpen(false);
    
    if (result.type === 'bookmark' && result.url) {
      window.open(result.url, '_blank');
    } else if (result.type === 'collection') {
      router.push(`/collections/${result.username}/${result.slug}`);
    } else {
      // 跳转到搜索结果页面
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // 处理历史搜索点击
  const handleHistoryClick = (historyQuery: string) => {
    setLocalQuery(historyQuery);
    setQuery(historyQuery);
    performSearch(historyQuery);
  };

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      
      if (e.key === 'Escape') {
        setIsGlobalSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen]);

  // 对话框打开时聚焦输入框
  useEffect(() => {
    if (isGlobalSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isGlobalSearchOpen]);

  // 获取结果图标
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'bookmark':
        return <Bookmark className="h-4 w-4" />;
      case 'collection':
        return <Folder className="h-4 w-4" />;
      case 'category':
        return <Tag className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // 获取结果类型标签
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bookmark':
        return '书签';
      case 'collection':
        return '集合';
      case 'category':
        return '分类';
      default:
        return '';
    }
  };

  return (
    <>
      {/* 触发器 */}
      {trigger ? (
        <div onClick={() => setIsGlobalSearchOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button
          variant="outline"
          className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
          onClick={() => setIsGlobalSearchOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">搜索书签...</span>
          <span className="inline-flex lg:hidden">搜索...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}

      {/* 搜索对话框 */}
      <Dialog open={isGlobalSearchOpen} onOpenChange={setIsGlobalSearchOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              全局搜索
            </DialogTitle>
          </DialogHeader>

          <Command className="rounded-lg border-none shadow-none">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                ref={inputRef}
                placeholder="搜索书签、集合、分类..."
                value={localQuery}
                onValueChange={handleInputChange}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {localQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setLocalQuery("");
                    setQuery("");
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <CommandList className="max-h-[400px] overflow-y-auto">
              {/* 搜索结果 */}
              {localQuery && (
                <>
                  {isSearching ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        搜索中...
                      </div>
                    </div>
                  ) : results.length > 0 ? (
                    <CommandGroup heading="搜索结果">
                      {results.slice(0, 8).map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleResultClick(result)}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                        >
                          <div className="flex-shrink-0">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{result.title}</span>
                              <Badge variant="secondary" className="text-xs">
                                {getTypeLabel(result.type)}
                              </Badge>
                            </div>
                            {result.description && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {result.description}
                              </p>
                            )}
                            {result.collection_name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                来自集合：{result.collection_name}
                              </p>
                            )}
                          </div>
                          {result.type === 'bookmark' && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                        </CommandItem>
                      ))}
                      {results.length > 8 && (
                        <CommandItem
                          onSelect={() => {
                            setIsGlobalSearchOpen(false);
                            router.push(`/search?q=${encodeURIComponent(localQuery)}`);
                          }}
                          className="text-center text-sm text-primary cursor-pointer"
                        >
                          查看全部 {results.length} 个结果
                        </CommandItem>
                      )}
                    </CommandGroup>
                  ) : (
                    <CommandEmpty>
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>未找到相关结果</p>
                        <p className="text-xs mt-1">尝试使用不同的关键词</p>
                      </div>
                    </CommandEmpty>
                  )}
                </>
              )}

              {/* 搜索历史 */}
              {!localQuery && searchHistory.length > 0 && (
                <>
                  <CommandGroup heading="最近搜索">
                    {searchHistory.slice(0, 5).map((historyItem, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleHistoryClick(historyItem)}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{historyItem}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="w-full text-xs text-muted-foreground"
                    >
                      清除搜索历史
                    </Button>
                  </div>
                </>
              )}

              {/* 空状态 */}
              {!localQuery && searchHistory.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>开始搜索您的书签</p>
                  <p className="text-xs mt-1">支持搜索书签标题、描述和网址</p>
                </div>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
