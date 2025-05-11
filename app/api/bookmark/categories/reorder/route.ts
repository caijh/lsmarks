import { NextRequest, NextResponse } from "next/server";
import { reorderBookmarkCategoriesById } from "@/services/bookmark/category";
import { getCurrentUserUuid } from "@/services/bookmark/auth";

// PUT /api/bookmark/categories/reorder
export async function PUT(request: NextRequest) {
  try {
    const currentUserUuid = await getCurrentUserUuid();
    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { categories } = await request.json();
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: "Categories array is required" }, { status: 400 });
    }
    
    // 验证数组格式
    for (const category of categories) {
      if (!category.uuid || typeof category.order_index !== 'number') {
        return NextResponse.json({ error: "Each category must have uuid and order_index" }, { status: 400 });
      }
    }
    
    const success = await reorderBookmarkCategoriesById(categories, currentUserUuid);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to reorder categories or not authorized" }, { status: 403 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/bookmark/categories/reorder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
