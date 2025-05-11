import { NextRequest, NextResponse } from "next/server";
import { 
  createBookmarkSubcategory, 
  getBookmarkSubcategoriesByCategory
} from "@/services/bookmark/subcategory";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { BookmarkSubcategoryFormData } from "@/types/bookmark/subcategory";

// GET /api/bookmark/subcategories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category_uuid = searchParams.get("category_uuid");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    
    if (!category_uuid) {
      return NextResponse.json({ error: "Category UUID is required" }, { status: 400 });
    }
    
    const subcategories = await getBookmarkSubcategoriesByCategory(category_uuid, page, limit);
    
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error in GET /api/bookmark/subcategories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/bookmark/subcategories
export async function POST(request: NextRequest) {
  try {
    const currentUserUuid = await getCurrentUserUuid();
    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData: BookmarkSubcategoryFormData = await request.json();
    
    // 验证必填字段
    if (!formData.name || !formData.category_uuid) {
      return NextResponse.json({ error: "Name and category_uuid are required" }, { status: 400 });
    }
    
    const subcategory = await createBookmarkSubcategory(formData, currentUserUuid);
    
    if (!subcategory) {
      return NextResponse.json({ error: "Failed to create subcategory or not authorized" }, { status: 403 });
    }
    
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/bookmark/subcategories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
