"use client";

import { ReactNode } from "react";

interface PermissionGuardProps {
  isAllowed: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ 
  isAllowed, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
