import { NextRequest, NextResponse } from "next/server";
import {
  getBookmarkCollectionDetails,
  updateBookmarkCollectionById,
  deleteBookmarkCollectionById
} from "@/services/bookmark/collection";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { BookmarkCollectionFormData } from "@/types/bookmark/collection";

// GET /api/bookmark/collections/[uuid]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  let uuid = '';
  try {
    const resolvedParams = await params;
    uuid = resolvedParams.uuid;

    const collection = await getBookmarkCollectionDetails(uuid);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error(`Error in GET /api/bookmark/collections/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/bookmark/collections/[uuid]
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

    const formData: BookmarkCollectionFormData = await request.json();

    // 验证必填字段
    if (!formData.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedCollection = await updateBookmarkCollectionById(uuid, formData, currentUserUuid);

    if (!updatedCollection) {
      return NextResponse.json({ error: "Failed to update collection or not authorized" }, { status: 403 });
    }

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error(`Error in PUT /api/bookmark/collections/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/bookmark/collections/[uuid]
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

    const success = await deleteBookmarkCollectionById(uuid, currentUserUuid);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete collection or not authorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/bookmark/collections/${uuid}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
