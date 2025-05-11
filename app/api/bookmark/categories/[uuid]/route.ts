import { NextRequest, NextResponse } from "next/server";
import {
  getBookmarkCategoryDetails,
  updateBookmarkCategoryById,
  deleteBookmarkCategoryById
} from "@/services/bookmark/category";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { BookmarkCategoryFormData } from "@/types/bookmark/category";

// GET /api/bookmark/categories/[uuid]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  let uuid = '';
  try {
    const resolvedParams = await params;
    uuid = resolvedParams.uuid;

    const category = await getBookmarkCategoryDetails(uuid);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(`Error in GET /api/bookmark/categories/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/bookmark/categories/[uuid]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  let uuid = '';
  try {
    const resolvedParams = await params;
    uuid = resolvedParams.uuid;
    const currentUserUuid = await getCurrentUserUuid();

    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData: BookmarkCategoryFormData = await request.json();

    // 验证必填字段
    if (!formData.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedCategory = await updateBookmarkCategoryById(uuid, formData, currentUserUuid);

    if (!updatedCategory) {
      return NextResponse.json({ error: "Failed to update category or not authorized" }, { status: 403 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(`Error in PUT /api/bookmark/categories/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/bookmark/categories/[uuid]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  let uuid = '';
  try {
    const resolvedParams = await params;
    uuid = resolvedParams.uuid;
    const currentUserUuid = await getCurrentUserUuid();

    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await deleteBookmarkCategoryById(uuid, currentUserUuid);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete category or not authorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/bookmark/categories/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
