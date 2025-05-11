"use client";

import { BookmarkSubcategory } from "@/types/bookmark/subcategory";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { PermissionGuard } from "../shared/permission-guard";

interface SubcategoryTabsProps {
  subcategories: BookmarkSubcategory[];
  selectedSubcategoryUuid?: string;
  onSelectSubcategory: (subcategoryUuid: string) => void;
  isOwner: boolean;
  editMode?: boolean;
  onAddSubcategory?: () => void;
  onEditSubcategory?: (subcategory: BookmarkSubcategory) => void;
  onDeleteSubcategory?: (subcategory: BookmarkSubcategory) => void;
}

export function SubcategoryTabs({
  subcategories,
  selectedSubcategoryUuid,
  onSelectSubcategory,
  isOwner,
  editMode = false,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
}: SubcategoryTabsProps) {
  // 如果没有选中的子分类，但有子分类列表，则默认选中第一个
  const effectiveSelectedUuid =
    selectedSubcategoryUuid || (subcategories.length > 0 ? subcategories[0].uuid : undefined);

  return (
    <div className="flex items-center justify-between mb-6">
      <Tabs
        value={effectiveSelectedUuid}
        onValueChange={onSelectSubcategory}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {subcategories.map((subcategory) => (
            <TabsTrigger
              key={subcategory.uuid}
              value={subcategory.uuid}
              className="relative group min-w-fit px-4 pr-6"
            >
              {subcategory.name}
              <PermissionGuard isAllowed={isOwner && editMode}>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 mr-[-20px] hidden group-hover:flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-5 w-5 rounded-full bg-background shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSubcategory?.(subcategory);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-5 w-5 rounded-full bg-background shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSubcategory?.(subcategory);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </PermissionGuard>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <PermissionGuard isAllowed={isOwner && editMode}>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddSubcategory}
          className="ml-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-1" />
          添加子分类
        </Button>
      </PermissionGuard>
    </div>
  );
}
