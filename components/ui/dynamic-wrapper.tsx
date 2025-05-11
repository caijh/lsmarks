"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DialogFallback, FormFallback } from "./dynamic-import";
import { ComponentType } from "react";

/**
 * 创建动态导入的对话框组件
 * @param importFunc 导入函数
 * @returns 动态导入的组件
 */
export function createDynamicDialog<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    loading: () => <DialogFallback />,
    ssr: false
  });
}

/**
 * 创建动态导入的表单组件
 * @param importFunc 导入函数
 * @returns 动态导入的组件
 */
export function createDynamicForm<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    loading: () => <FormFallback />,
    ssr: false
  });
}
