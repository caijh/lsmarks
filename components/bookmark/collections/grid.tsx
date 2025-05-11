"use client";

import { BookmarkCollection } from "@/types/bookmark/collection";
import { BookmarkCollectionCard } from "./card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

interface BookmarkCollectionGridProps {
  collections: BookmarkCollection[];
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (collection: BookmarkCollection) => void;
  onDelete?: (collection: BookmarkCollection) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  locale?: string;
}

export function BookmarkCollectionGrid({
  collections,
  isOwner,
  editMode = false,
  onEdit,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  locale = 'zh', // 默认为中文
}: BookmarkCollectionGridProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    if (page < 1 || (totalPages && page > totalPages)) return;

    if (onPageChange) {
      onPageChange(page);
    } else {
      // 默认行为：如果没有提供 onPageChange，则使用客户端导航
      // 使用 window.location.href 进行导航，避免国际化路由问题
      window.location.href = `/collections?page=${page}`;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {collections.map((collection, index) => (
          <div
            key={collection.uuid}
            className="transition-all duration-300"
            style={{
              animationDelay: `${index * 50}ms`,
              opacity: 1,
              transform: 'translateY(0)'
            }}
          >
            <BookmarkCollectionCard
              collection={collection}
              isOwner={isOwner}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              locale={locale}
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 sm:gap-3 mt-6 sm:mt-8 md:mt-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 sm:h-9 px-2 sm:px-4 border-primary/30 hover:bg-primary/10 shadow-sm text-xs sm:text-sm"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
            <span className="hidden xs:inline">{locale === 'zh' ? '上一页' : 'Prev'}</span>
          </Button>
          <div className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-md bg-muted/40 border border-border/50 shadow-sm">
            {locale === 'zh'
              ? `${currentPage}/${totalPages}`
              : `${currentPage}/${totalPages}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 sm:h-9 px-2 sm:px-4 border-primary/30 hover:bg-primary/10 shadow-sm text-xs sm:text-sm"
          >
            <span className="hidden xs:inline">{locale === 'zh' ? '下一页' : 'Next'}</span>
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
