import { NextRequest, NextResponse } from "next/server";
import {
  createBookmarkItem,
  getBookmarkItemsBySubcategory
} from "@/services/bookmark/item";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { BookmarkItemFormData } from "@/types/bookmark/item";
import { canUserCreateBookmark } from "@/models/user-level";

// GET /api/bookmark/items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategory_uuid = searchParams.get("subcategory_uuid");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!subcategory_uuid) {
      return NextResponse.json({ error: "Subcategory UUID is required" }, { status: 400 });
    }

    const items = await getBookmarkItemsBySubcategory(subcategory_uuid, page, limit);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error in GET /api/bookmark/items:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/bookmark/items
export async function POST(request: NextRequest) {
  try {
    const currentUserUuid = await getCurrentUserUuid();
    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData: BookmarkItemFormData = await request.json();

    // 验证必填字段
    if (!formData.title || !formData.url || !formData.subcategory_uuid) {
      return NextResponse.json({ error: "Title, URL, and subcategory_uuid are required" }, { status: 400 });
    }

    // 检查用户是否可以在此子分类中创建新的书签
    const canCreate = await canUserCreateBookmark(formData.subcategory_uuid, currentUserUuid);
    if (!canCreate) {
      return NextResponse.json({
        error: "已达到您当前用户等级的书签数量限制。请升级您的账户以添加更多书签。",
        code: "USER_LEVEL_LIMIT_REACHED"
      }, { status: 403 });
    }

    const item = await createBookmarkItem(formData, currentUserUuid);

    if (!item) {
      return NextResponse.json({ error: "Failed to create item or not authorized" }, { status: 403 });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/bookmark/items:", error);

    // 检查是否是用户等级限制错误
    if (error instanceof Error && error.message.includes('用户等级的书签数量限制')) {
      return NextResponse.json({
        error: error.message,
        code: "USER_LEVEL_LIMIT_REACHED"
      }, { status: 403 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
