import { NextRequest, NextResponse } from "next/server";
import {
  getBookmarkSubcategoryDetails,
  updateBookmarkSubcategoryById,
  deleteBookmarkSubcategoryById
} from "@/services/bookmark/subcategory";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { BookmarkSubcategoryFormData } from "@/types/bookmark/subcategory";

// GET /api/bookmark/subcategories/[uuid]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  let uuid = '';
  try {
    const resolvedParams = await params;
    uuid = resolvedParams.uuid;

    const subcategory = await getBookmarkSubcategoryDetails(uuid);

    if (!subcategory) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error(`Error in GET /api/bookmark/subcategories/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/bookmark/subcategories/[uuid]
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

    const formData: BookmarkSubcategoryFormData = await request.json();

    // 验证必填字段
    if (!formData.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedSubcategory = await updateBookmarkSubcategoryById(uuid, formData, currentUserUuid);

    if (!updatedSubcategory) {
      return NextResponse.json({ error: "Failed to update subcategory or not authorized" }, { status: 403 });
    }

    return NextResponse.json(updatedSubcategory);
  } catch (error) {
    console.error(`Error in PUT /api/bookmark/subcategories/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/bookmark/subcategories/[uuid]
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

    const success = await deleteBookmarkSubcategoryById(uuid, currentUserUuid);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete subcategory or not authorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/bookmark/subcategories/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
