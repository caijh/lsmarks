"use client";

import { useEffect, useState } from "react";
import { Edit, Eye } from "lucide-react";

interface EditModeToggleProps {
  isOwner: boolean;
  onChange: (editMode: boolean) => void;
  value?: boolean; // 添加一个可选的value属性，用于控制组件的状态
}

export function EditModeToggle({ isOwner, onChange, value = false }: EditModeToggleProps) {
  const [editMode, setEditMode] = useState(value);

  // 当外部value变化时，同步内部状态
  useEffect(() => {
    setEditMode(value);
  }, [value]);

  // 切换编辑模式
  const toggleEditMode = (checked: boolean) => {
    setEditMode(checked);
    onChange(checked);
  };

  // 如果不是所有者，不显示切换按钮
  if (!isOwner) return null;

  return (
    <div
      className="flex items-center justify-center h-7 w-7 bg-background/30 backdrop-blur-sm border border-border/30 rounded-full shadow-sm hover:bg-background/50 transition-all cursor-pointer"
      onClick={() => toggleEditMode(!editMode)}
      title={editMode ? "切换到浏览模式" : "切换到编辑模式"}
    >
      {editMode ? (
        <Edit className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </div>
  );
}
