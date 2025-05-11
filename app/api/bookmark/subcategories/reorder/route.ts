import { NextRequest, NextResponse } from "next/server";
import { reorderBookmarkSubcategoriesById } from "@/services/bookmark/subcategory";
import { getCurrentUserUuid } from "@/services/bookmark/auth";

// PUT /api/bookmark/subcategories/reorder
export async function PUT(request: NextRequest) {
  try {
    const currentUserUuid = await getCurrentUserUuid();
    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { subcategories } = await request.json();
    
    if (!subcategories || !Array.isArray(subcategories) || subcategories.length === 0) {
      return NextResponse.json({ error: "Subcategories array is required" }, { status: 400 });
    }
    
    // 验证数组格式
    for (const subcategory of subcategories) {
      if (!subcategory.uuid || typeof subcategory.order_index !== 'number') {
        return NextResponse.json({ error: "Each subcategory must have uuid and order_index" }, { status: 400 });
      }
    }
    
    const success = await reorderBookmarkSubcategoriesById(subcategories, currentUserUuid);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to reorder subcategories or not authorized" }, { status: 403 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/bookmark/subcategories/reorder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
