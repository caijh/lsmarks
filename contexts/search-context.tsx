"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface SearchResult {
  id: string;
  type: 'bookmark' | 'collection' | 'category';
  title: string;
  description?: string;
  url?: string;
  collection_name?: string;
  category_name?: string;
  subcategory_name?: string;
  icon_url?: string;
  created_at: string;
  username?: string;
  slug?: string;
  is_public?: boolean;
}

interface SearchFilters {
  type?: 'all' | 'bookmark' | 'collection' | 'category';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  collection?: string;
  category?: string;
}

interface SearchContextType {
  // 搜索状态
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  setResults: (results: SearchResult[]) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  
  // 搜索历史
  searchHistory: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  
  // 筛选器
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  
  // 搜索功能
  performSearch: (query: string, filters?: SearchFilters) => Promise<void>;
  clearSearch: () => void;
  
  // 全局搜索状态
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  
  // 集合内搜索状态
  collectionSearchQuery: string;
  setCollectionSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 基础状态
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("");
  
  // 搜索历史
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // 筛选器
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    dateRange: 'all'
  });

  // 从localStorage加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('lsmarks-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // 保存搜索历史到localStorage
  useEffect(() => {
    localStorage.setItem('lsmarks-search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // 从URL参数同步搜索状态
  useEffect(() => {
    const urlQuery = searchParams?.get('q') || '';
    const urlType = searchParams?.get('type') as SearchFilters['type'] || 'all';
    const urlDateRange = searchParams?.get('date') as SearchFilters['dateRange'] || 'all';
    
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
    
    setFilters(prev => ({
      ...prev,
      type: urlType,
      dateRange: urlDateRange
    }));
  }, [searchParams, query]);

  // 添加到搜索历史
  const addToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      const newHistory = [searchQuery, ...filtered].slice(0, 10); // 保留最近10条
      return newHistory;
    });
  }, []);

  // 清除搜索历史
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('lsmarks-search-history');
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: searchFilters?.type || filters.type || 'all',
        date: searchFilters?.dateRange || filters.dateRange || 'all',
        ...(searchFilters?.collection && { collection: searchFilters.collection }),
        ...(searchFilters?.category && { category: searchFilters.category })
      });

      const response = await fetch(`/api/search?${params}`);
      
      if (!response.ok) {
        throw new Error('搜索请求失败');
      }
      
      const data = await response.json();
      setResults(data.results || []);
      
      // 添加到搜索历史
      addToHistory(searchQuery);
      
      // 更新URL（仅在搜索页面）
      if (pathname === '/search') {
        const newUrl = `/search?${params}`;
        router.push(newUrl);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [filters, addToHistory, router, pathname]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setCollectionSearchQuery("");
    
    // 如果在搜索页面，返回首页
    if (pathname === '/search') {
      router.push('/');
    }
  }, [router, pathname]);

  const value: SearchContextType = {
    query,
    setQuery,
    results,
    setResults,
    isSearching,
    setIsSearching,
    searchHistory,
    addToHistory,
    clearHistory,
    filters,
    setFilters,
    performSearch,
    clearSearch,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    collectionSearchQuery,
    setCollectionSearchQuery
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
