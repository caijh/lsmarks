import { NextRequest, NextResponse } from "next/server";
import { reorderBookmarkItemsById } from "@/services/bookmark/item";
import { getCurrentUserUuid } from "@/services/bookmark/auth";

// PUT /api/bookmark/items/reorder
export async function PUT(request: NextRequest) {
  try {
    const currentUserUuid = await getCurrentUserUuid();
    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { items } = await request.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }
    
    // 验证数组格式
    for (const item of items) {
      if (!item.uuid || typeof item.order_index !== 'number') {
        return NextResponse.json({ error: "Each item must have uuid and order_index" }, { status: 400 });
      }
    }
    
    const success = await reorderBookmarkItemsById(items, currentUserUuid);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to reorder items or not authorized" }, { status: 403 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/bookmark/items/reorder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
