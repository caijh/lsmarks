"use client";

import { BookmarkCollection } from "@/types/bookmark/collection";
import { BookmarkCollectionGrid } from "./grid";

interface UserCollectionGridWrapperProps {
  collections: BookmarkCollection[];
  isOwner: boolean;
  currentPage: number;
  totalPages: number;
  username: string;
}

export function UserCollectionGridWrapper({
  collections,
  isOwner,
  currentPage,
  totalPages,
  username,
}: UserCollectionGridWrapperProps) {
  const handlePageChange = (newPage: number) => {
    // 获取当前语言
    const locale = document.documentElement.lang || 'zh';
    // 客户端导航到新页面
    window.location.href = `/${locale}/collections/${username}?page=${newPage}`;
  };

  return (
    <BookmarkCollectionGrid
      collections={collections}
      isOwner={isOwner}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
