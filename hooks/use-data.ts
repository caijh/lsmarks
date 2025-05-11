"use client";

import { useCallback, useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import store, { StoreKey } from "@/lib/store";

// 数据状态
interface DataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * 使用会话钩子
 * @returns 会话状态
 */
export function useSession() {
  const [state, setState] = useState<DataState<any>>({
    data: store.get(StoreKey.SESSION),
    isLoading: !store.has(StoreKey.SESSION),
    error: null
  });

  const fetchSession = useCallback(async () => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await apiClient.getSession();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
    }
  }, [state.isLoading]);

  // 订阅存储变更
  useEffect(() => {
    const unsubscribe = store.subscribe(StoreKey.SESSION, () => {
      setState({
        data: store.get(StoreKey.SESSION),
        isLoading: false,
        error: null
      });
    });

    // 如果没有会话数据，获取会话
    if (!state.data && !state.isLoading) {
      fetchSession();
    }

    return unsubscribe;
  }, [state.data, state.isLoading, fetchSession]);

  return {
    ...state,
    status: state.data ? "authenticated" : state.isLoading ? "loading" : "unauthenticated",
    update: fetchSession
  };
}

/**
 * 使用用户信息钩子
 * @returns 用户信息状态
 */
export function useUser() {
  const [state, setState] = useState<DataState<any>>({
    data: store.get(StoreKey.USER),
    isLoading: !store.has(StoreKey.USER),
    error: null
  });

  const fetchUser = useCallback(async () => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await apiClient.getUserInfo();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
    }
  }, [state.isLoading]);

  // 订阅存储变更
  useEffect(() => {
    const unsubscribe = store.subscribe(StoreKey.USER, () => {
      setState({
        data: store.get(StoreKey.USER),
        isLoading: false,
        error: null
      });
    });

    // 如果没有用户数据，获取用户信息
    if (!state.data && !state.isLoading) {
      fetchUser();
    }

    return unsubscribe;
  }, [state.data, state.isLoading, fetchUser]);

  return {
    ...state,
    refetch: fetchUser
  };
}

/**
 * 使用书签集合钩子
 * @param page 页码
 * @param limit 每页数量
 * @param userUuid 用户UUID
 * @returns 书签集合状态
 */
export function useBookmarkCollections(page = 1, limit = 20, userUuid?: string) {
  // 生成缓存键
  const cacheKey = `collections:${page}:${limit}:${userUuid || ''}`;

  const [state, setState] = useState<DataState<any>>({
    data: store.get(cacheKey),
    isLoading: !store.has(cacheKey),
    error: null
  });

  const fetchCollections = useCallback(async () => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await apiClient.getBookmarkCollections(page, limit, userUuid);
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
    }
  }, [page, limit, userUuid, state.isLoading]);

  // 订阅存储变更
  useEffect(() => {
    const unsubscribe = store.subscribe(cacheKey, () => {
      setState({
        data: store.get(cacheKey),
        isLoading: false,
        error: null
      });
    });

    // 如果没有集合数据，获取集合
    if (!state.data && !state.isLoading) {
      fetchCollections();
    }

    return unsubscribe;
  }, [cacheKey, state.data, state.isLoading, fetchCollections]);

  return {
    ...state,
    refetch: fetchCollections
  };
}

/**
 * 使用书签集合详情钩子
 * @param uuid 集合UUID
 * @returns 集合详情状态
 */
export function useBookmarkCollection(uuid: string) {
  // 生成缓存键
  const cacheKey = `collection:${uuid}`;

  const [state, setState] = useState<DataState<any>>({
    data: store.get(cacheKey),
    isLoading: !store.has(cacheKey),
    error: null
  });

  const fetchCollection = useCallback(async () => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await apiClient.getBookmarkCollection(uuid);
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
    }
  }, [uuid, state.isLoading]);

  // 订阅存储变更
  useEffect(() => {
    const unsubscribe = store.subscribe(cacheKey, () => {
      setState({
        data: store.get(cacheKey),
        isLoading: false,
        error: null
      });
    });

    // 如果没有集合详情数据，获取集合详情
    if (!state.data && !state.isLoading) {
      fetchCollection();
    }

    return unsubscribe;
  }, [cacheKey, state.data, state.isLoading, fetchCollection]);

  return {
    ...state,
    refetch: fetchCollection
  };
}

/**
 * 使用书签项目钩子
 * @param collectionUuid 集合UUID
 * @returns 书签项目状态
 */
export function useBookmarkItems(collectionUuid: string) {
  // 生成缓存键
  const cacheKey = `items:${collectionUuid}`;

  const [state, setState] = useState<DataState<any>>({
    data: store.get(cacheKey),
    isLoading: !store.has(cacheKey),
    error: null
  });

  const fetchItems = useCallback(async () => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await apiClient.getBookmarkItems(collectionUuid);
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
    }
  }, [collectionUuid, state.isLoading]);

  // 订阅存储变更
  useEffect(() => {
    const unsubscribe = store.subscribe(cacheKey, () => {
      setState({
        data: store.get(cacheKey),
        isLoading: false,
        error: null
      });
    });

    // 如果没有项目数据，获取项目
    if (!state.data && !state.isLoading) {
      fetchItems();
    }

    return unsubscribe;
  }, [cacheKey, state.data, state.isLoading, fetchItems]);

  return {
    ...state,
    refetch: fetchItems
  };
}
