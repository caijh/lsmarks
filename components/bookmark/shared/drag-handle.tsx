"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragHandleProps {
  className?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export function DragHandle({ className, onPointerDown }: DragHandleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing",
        className
      )}
      onPointerDown={onPointerDown}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
