"use client";

import { useState } from "react";
import { BookmarkSubcategory } from "@/types/bookmark/subcategory";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { PermissionGuard } from "../shared/permission-guard";
import { DragHandle } from "../shared/drag-handle";
import { Reorder, useDragControls } from "framer-motion";

interface BookmarkSubcategoryListProps {
  subcategories: BookmarkSubcategory[];
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (subcategory: BookmarkSubcategory) => void;
  onDelete?: (subcategory: BookmarkSubcategory) => void;
  onSelect?: (subcategory: BookmarkSubcategory) => void;
  selectedSubcategoryUuid?: string;
  onReorder?: (subcategories: BookmarkSubcategory[]) => void;
}

export function BookmarkSubcategoryList({
  subcategories,
  isOwner,
  editMode = false,
  onEdit,
  onDelete,
  onSelect,
  selectedSubcategoryUuid,
  onReorder,
}: BookmarkSubcategoryListProps) {
  const [reorderEnabled, setReorderEnabled] = useState(false);

  const handleReorderComplete = (newOrder: BookmarkSubcategory[]) => {
    onReorder?.(newOrder);
  };

  return (
    <div className="space-y-2">
      {editMode && onReorder && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReorderEnabled(!reorderEnabled)}
          className="mb-2"
        >
          {reorderEnabled ? "完成排序" : "排序子分类"}
        </Button>
      )}

      {reorderEnabled && onReorder ? (
        <Reorder.Group
          axis="y"
          values={subcategories}
          onReorder={handleReorderComplete}
          className="space-y-2"
        >
          {subcategories.map((subcategory) => (
            <ReorderableSubcategory
              key={subcategory.uuid}
              subcategory={subcategory}
              isOwner={isOwner}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              isSelected={subcategory.uuid === selectedSubcategoryUuid}
            />
          ))}
        </Reorder.Group>
      ) : (
        <div className="space-y-2">
          {subcategories.map((subcategory) => (
            <SubcategoryItem
              key={subcategory.uuid}
              subcategory={subcategory}
              isOwner={isOwner}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              isSelected={subcategory.uuid === selectedSubcategoryUuid}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SubcategoryItemProps {
  subcategory: BookmarkSubcategory;
  isOwner: boolean;
  editMode?: boolean;
  onEdit?: (subcategory: BookmarkSubcategory) => void;
  onDelete?: (subcategory: BookmarkSubcategory) => void;
  onSelect?: (subcategory: BookmarkSubcategory) => void;
  isSelected?: boolean;
}

function SubcategoryItem({
  subcategory,
  isOwner,
  editMode = false,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}: SubcategoryItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg ${
        isSelected ? "bg-muted" : ""
      } ${onSelect ? "cursor-pointer" : ""}`}
      onClick={() => onSelect?.(subcategory)}
    >
      <div>
        <h3 className="font-medium">{subcategory.name}</h3>
        {subcategory.description && (
          <p className="text-sm text-muted-foreground">
            {subcategory.description}
          </p>
        )}
      </div>
      <PermissionGuard isAllowed={isOwner && editMode}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(subcategory);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </PermissionGuard>
    </div>
  );
}

interface ReorderableSubcategoryProps extends SubcategoryItemProps {}

function ReorderableSubcategory(props: ReorderableSubcategoryProps) {
  const { subcategory } = props;
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={subcategory}
      dragControls={dragControls}
      className="flex items-center gap-2 p-3 border rounded-lg bg-background"
    >
      <DragHandle
        className="cursor-grab"
        onPointerDown={(e) => dragControls.start(e)}
      />
      <SubcategoryItem {...props} />
    </Reorder.Item>
  );
}
