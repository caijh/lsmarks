import { NextRequest, NextResponse } from "next/server";
import { 
  createBookmarkCategory, 
  getBookmarkCategoriesByCollection
} from "@/services/bookmark/category";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { BookmarkCategoryFormData } from "@/types/bookmark/category";

// GET /api/bookmark/categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection_uuid = searchParams.get("collection_uuid");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    
    if (!collection_uuid) {
      return NextResponse.json({ error: "Collection UUID is required" }, { status: 400 });
    }
    
    const categories = await getBookmarkCategoriesByCollection(collection_uuid, page, limit);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error in GET /api/bookmark/categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/bookmark/categories
export async function POST(request: NextRequest) {
  try {
    const currentUserUuid = await getCurrentUserUuid();
    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData: BookmarkCategoryFormData = await request.json();
    
    // 验证必填字段
    if (!formData.name || !formData.collection_uuid) {
      return NextResponse.json({ error: "Name and collection_uuid are required" }, { status: 400 });
    }
    
    const category = await createBookmarkCategory(formData, currentUserUuid);
    
    if (!category) {
      return NextResponse.json({ error: "Failed to create category or not authorized" }, { status: 403 });
    }
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/bookmark/categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
