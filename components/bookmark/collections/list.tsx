"use client";

import { BookmarkCollection, BookmarkCollectionWithStats } from "@/types/bookmark/collection";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink, Lock, Globe } from "@/components/ui/icons";
import Link from "next/link";
import { PermissionGuard } from "../shared/permission-guard";

interface BookmarkCollectionListProps {
  collections: (BookmarkCollection | BookmarkCollectionWithStats)[];
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (collection: BookmarkCollection | BookmarkCollectionWithStats) => void;
  onDelete?: (collection: BookmarkCollection | BookmarkCollectionWithStats) => void;
}

export function BookmarkCollectionList({
  collections,
  isOwner,
  editMode = false,
  onEdit,
  onDelete,
}: BookmarkCollectionListProps) {
  // 移除国际化支持
  return (
    <div className="space-y-4">
      {collections.map((collection) => (
        <div
          key={collection.uuid}
          className="flex items-center justify-between p-4 border rounded-lg bg-card/65 backdrop-blur-sm"
        >
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{collection.name}</h3>
              {collection.is_public ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {collection.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {collection.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              {'category_count' in collection && collection.category_count !== undefined && (
                <div>{collection.category_count} 个分类</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/collections/${'user_username' in collection ? collection.user_username : 'user'}/${collection.slug || collection.uuid}`} passHref>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                查看
              </Button>
            </Link>
            <PermissionGuard isAllowed={isOwner && editMode}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(collection)}
                className="gap-1"
              >
                <Edit className="h-4 w-4" />
                编辑
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete?.(collection)}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                删除
              </Button>
            </PermissionGuard>
          </div>
        </div>
      ))}
    </div>
  );
}
