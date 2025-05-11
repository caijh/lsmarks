import { NextRequest, NextResponse } from "next/server";
import {
  getBookmarkItemDetails,
  updateBookmarkItemById,
  deleteBookmarkItemById
} from "@/services/bookmark/item";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { BookmarkItemFormData } from "@/types/bookmark/item";

// GET /api/bookmark/items/[uuid]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  let uuid = '';
  try {
    const resolvedParams = await params;
    uuid = resolvedParams.uuid;

    const item = await getBookmarkItemDetails(uuid);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error in GET /api/bookmark/items/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/bookmark/items/[uuid]
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

    const formData: BookmarkItemFormData = await request.json();

    // 验证必填字段
    if (!formData.title || !formData.url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    const updatedItem = await updateBookmarkItemById(uuid, formData, currentUserUuid);

    if (!updatedItem) {
      return NextResponse.json({ error: "Failed to update item or not authorized" }, { status: 403 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Error in PUT /api/bookmark/items/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/bookmark/items/[uuid]
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

    const success = await deleteBookmarkItemById(uuid, currentUserUuid);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete item or not authorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/bookmark/items/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
