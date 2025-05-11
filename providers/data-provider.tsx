"use client";

import { ReactNode, createContext, useContext, useEffect } from "react";
import { useSession, useUser } from "@/hooks/use-data";
import apiClient from "@/lib/api-client";
import store, { StoreKey } from "@/lib/store";

// 数据上下文接口
interface DataContextValue {
  clearCache: (key?: string) => void;
  session: ReturnType<typeof useSession>;
  user: ReturnType<typeof useUser>;
}

// 创建数据上下文
const DataContext = createContext<DataContextValue>({
  clearCache: () => {},
  session: {
    data: null,
    isLoading: false,
    error: null,
    status: "unauthenticated",
    update: async () => {}
  },
  user: {
    data: null,
    isLoading: false,
    error: null,
    refetch: async () => {}
  }
});

// 使用数据上下文的钩子
export const useDataContext = () => useContext(DataContext);

/**
 * 数据提供者组件
 * @param children 子组件
 * @returns 数据提供者组件
 */
export function DataProvider({ children }: { children: ReactNode }) {
  // 获取会话和用户信息
  const session = useSession();
  const user = useUser();

  // 当会话变化时，如果会话不存在，清除用户信息
  useEffect(() => {
    if (session.status === "unauthenticated" && store.has(StoreKey.USER)) {
      store.remove(StoreKey.USER);
    }
  }, [session.status]);

  // 监听网络状态变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      console.log('Network is online, refreshing data...');
      // 网络恢复时刷新会话和用户信息
      session.update();
      user.refetch();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [session, user]);

  // 提供上下文值
  const contextValue: DataContextValue = {
    clearCache: (key?: string) => {
      if (key) {
        store.remove(key);
      } else {
        store.clear();
      }
    },
    session,
    user
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}
