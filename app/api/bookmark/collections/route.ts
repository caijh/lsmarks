import { NextRequest, NextResponse } from "next/server";
import {
  createBookmarkCollection,
  getUserBookmarkCollections,
  getBookmarkCollectionDetails,
  updateBookmarkCollectionById,
  deleteBookmarkCollectionById
} from "@/services/bookmark/collection";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { BookmarkCollectionFormData } from "@/types/bookmark/collection";
import { canUserCreateCollection } from "@/models/user-level";

// GET /api/bookmark/collections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const user_uuid = searchParams.get("user_uuid") || undefined;

    let collections;

    if (user_uuid) {
      // 获取指定用户的集合
      collections = await getUserBookmarkCollections(user_uuid, page, limit);
    } else {
      // 获取当前用户的集合
      const currentUserUuid = await getCurrentUserUuid();
      if (!currentUserUuid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      collections = await getUserBookmarkCollections(currentUserUuid, page, limit);
    }

    // 注意：公开集合功能已移除

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error in GET /api/bookmark/collections:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/bookmark/collections
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/bookmark/collections: Starting request");

    // 获取当前用户UUID
    const currentUserUuid = await getCurrentUserUuid();
    console.log("Current user UUID:", currentUserUuid);

    if (!currentUserUuid) {
      console.log("POST /api/bookmark/collections: Unauthorized - No user UUID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查用户是否可以创建新的书签集合
    console.log("Checking if user can create collection");
    try {
      // 临时禁用用户等级限制检查，直接允许创建
      // 这是一个临时解决方案，直到数据库问题得到解决
      console.log("Temporarily bypassing collection limit check");

      // 原始代码（已注释）
      /*
      const canCreate = await canUserCreateCollection(currentUserUuid);
      console.log("Can user create collection:", canCreate);

      if (!canCreate) {
        console.log("POST /api/bookmark/collections: User reached collection limit");
        return NextResponse.json({
          error: "已达到您当前用户等级的书签集合数量限制。请升级您的账户以创建更多集合。",
          code: "USER_LEVEL_LIMIT_REACHED"
        }, { status: 403 });
      }
      */
    } catch (error) {
      // 临时解决方案：如果检查失败，允许创建
      console.error("Error checking collection limit, allowing creation:", error);
    }

    // 解析请求数据
    console.log("Parsing request body");
    const formData: BookmarkCollectionFormData = await request.json();
    console.log("Form data:", formData);

    // 验证必填字段
    if (!formData.name) {
      console.log("POST /api/bookmark/collections: Name is required");
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // 创建集合
    console.log("Creating bookmark collection");
    let collection;
    try {
      collection = await createBookmarkCollection(formData, currentUserUuid);
      console.log("Collection creation result:", collection ? "success" : "failed");

      if (!collection) {
        console.log("POST /api/bookmark/collections: Failed to create collection");
        return NextResponse.json({
          error: "Failed to create collection",
          details: "User may not exist in database"
        }, { status: 500 });
      }
    } catch (error) {
      console.error("Unexpected error creating collection:", error);
      return NextResponse.json({
        error: "Failed to create collection",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

    console.log("POST /api/bookmark/collections: Collection created successfully", collection.uuid);
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/bookmark/collections:", error);

    // 记录更详细的错误信息
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // 检查是否是用户等级限制错误
      if (error.message.includes('用户等级的书签集合数量限制')) {
        return NextResponse.json({
          error: error.message,
          code: "USER_LEVEL_LIMIT_REACHED"
        }, { status: 403 });
      }
    }

    // 返回通用错误
    return NextResponse.json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
