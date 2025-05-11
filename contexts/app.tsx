"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";
import { ContextValue } from "@/types/context";
import { useDataContext } from "@/providers/data-provider";

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  // 使用数据上下文
  const { user } = useDataContext();

  // 登录模态框状态
  const [showSignModal, setShowSignModal] = useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        showSignModal,
        setShowSignModal,
        user: user.data,
        // 保留setUser接口兼容性，但实际上不再需要手动设置用户
        setUser: () => {
          console.warn("setUser is deprecated. User state is now managed by DataProvider.");
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
