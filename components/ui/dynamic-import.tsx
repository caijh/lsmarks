"use client";

import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DynamicImportProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 动态导入包装器组件
 * 用于包装动态导入的组件，提供加载状态显示
 */
export function DynamicImport({ children, fallback }: DynamicImportProps) {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      {children}
    </Suspense>
  );
}

/**
 * 默认的加载状态组件
 */
function DefaultFallback() {
  return (
    <div className="flex flex-col space-y-3 p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

/**
 * 对话框加载状态组件
 */
export function DialogFallback() {
  return (
    <div className="flex flex-col space-y-3 p-4 max-w-md mx-auto">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-3 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

/**
 * 表单加载状态组件
 */
export function FormFallback() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-end pt-4">
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
