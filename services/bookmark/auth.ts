import { BookmarkAuthResult, BookmarkOwnershipResult } from "@/types/bookmark/auth";
import { findBookmarkCollectionByUuid } from "@/models/bookmark/collection";
import { findBookmarkCategoryByUuid } from "@/models/bookmark/category";
import { findBookmarkSubcategoryByUuid } from "@/models/bookmark/subcategory";
import { findBookmarkItemByUuid } from "@/models/bookmark/item";
import { findUserByUuid } from "@/models/user";
import { getUserUuid, getUserUuidClient } from "@/services/user";
import { auth } from "@/auth";

// 验证用户是否有权限访问集合
export async function validateCollectionAccess(
  collection_uuid: string,
  user_uuid?: string
): Promise<BookmarkAuthResult> {
  try {
    // 获取集合信息
    const collection = await findBookmarkCollectionByUuid(collection_uuid);

    if (!collection) {
      return { authorized: false, reason: "collection-not-found" };
    }

    // 如果集合是公开的，任何人都可以访问
    if (collection.is_public) {
      return { authorized: true };
    }

    // 如果集合是私有的，只有所有者可以访问
    if (!user_uuid) {
      return { authorized: false, reason: "not-authenticated" };
    }

    if (collection.user_uuid !== user_uuid) {
      return { authorized: false, reason: "not-authorized" };
    }

    return { authorized: true };
  } catch (error) {
    console.error("Error validating collection access:", error);
    return { authorized: false, reason: "server-error" };
  }
}

// 验证用户是否有权限访问分类
export async function validateCategoryAccess(
  category_uuid: string,
  user_uuid?: string
): Promise<BookmarkAuthResult> {
  try {
    // 获取分类信息
    const category = await findBookmarkCategoryByUuid(category_uuid);

    if (!category) {
      return { authorized: false, reason: "category-not-found" };
    }

    // 验证集合访问权限
    return await validateCollectionAccess(category.collection_uuid, user_uuid);
  } catch (error) {
    console.error("Error validating category access:", error);
    return { authorized: false, reason: "server-error" };
  }
}

// 验证用户是否有权限访问子分类
export async function validateSubcategoryAccess(
  subcategory_uuid: string,
  user_uuid?: string
): Promise<BookmarkAuthResult> {
  try {
    // 获取子分类信息
    const subcategory = await findBookmarkSubcategoryByUuid(subcategory_uuid);

    if (!subcategory) {
      return { authorized: false, reason: "subcategory-not-found" };
    }

    // 验证分类访问权限
    return await validateCategoryAccess(subcategory.category_uuid, user_uuid);
  } catch (error) {
    console.error("Error validating subcategory access:", error);
    return { authorized: false, reason: "server-error" };
  }
}

// 验证用户是否有权限访问书签
export async function validateItemAccess(
  item_uuid: string,
  user_uuid?: string
): Promise<BookmarkAuthResult> {
  try {
    // 获取书签信息
    const item = await findBookmarkItemByUuid(item_uuid);

    if (!item) {
      return { authorized: false, reason: "item-not-found" };
    }

    // 验证子分类访问权限
    return await validateSubcategoryAccess(item.subcategory_uuid, user_uuid);
  } catch (error) {
    console.error("Error validating item access:", error);
    return { authorized: false, reason: "server-error" };
  }
}

// 验证集合所有权
export async function validateCollectionOwnership(
  collection_uuid: string,
  user_uuid?: string
): Promise<BookmarkOwnershipResult> {
  try {
    // 获取集合信息
    const collection = await findBookmarkCollectionByUuid(collection_uuid);

    if (!collection) {
      return { isOwner: false, reason: "collection-not-found" };
    }

    // 如果没有提供用户UUID，则不是所有者
    if (!user_uuid) {
      return { isOwner: false, reason: "not-authenticated" };
    }

    // 验证所有权
    if (collection.user_uuid !== user_uuid) {
      return { isOwner: false, reason: "not-owner" };
    }

    return { isOwner: true };
  } catch (error) {
    console.error("Error validating collection ownership:", error);
    return { isOwner: false, reason: "server-error" };
  }
}

// 验证分类所有权
export async function validateCategoryOwnership(
  category_uuid: string,
  user_uuid?: string
): Promise<BookmarkOwnershipResult> {
  try {
    // 获取分类信息
    const category = await findBookmarkCategoryByUuid(category_uuid);

    if (!category) {
      return { isOwner: false, reason: "category-not-found" };
    }

    // 如果没有提供用户UUID，则不是所有者
    if (!user_uuid) {
      return { isOwner: false, reason: "not-authenticated" };
    }

    // 验证所有权
    if (category.user_uuid !== user_uuid) {
      return { isOwner: false, reason: "not-owner" };
    }

    return { isOwner: true };
  } catch (error) {
    console.error("Error validating category ownership:", error);
    return { isOwner: false, reason: "server-error" };
  }
}

// 验证子分类所有权
export async function validateSubcategoryOwnership(
  subcategory_uuid: string,
  user_uuid?: string
): Promise<BookmarkOwnershipResult> {
  try {
    // 获取子分类信息
    const subcategory = await findBookmarkSubcategoryByUuid(subcategory_uuid);

    if (!subcategory) {
      return { isOwner: false, reason: "subcategory-not-found" };
    }

    // 如果没有提供用户UUID，则不是所有者
    if (!user_uuid) {
      return { isOwner: false, reason: "not-authenticated" };
    }

    // 验证所有权
    if (subcategory.user_uuid !== user_uuid) {
      return { isOwner: false, reason: "not-owner" };
    }

    return { isOwner: true };
  } catch (error) {
    console.error("Error validating subcategory ownership:", error);
    return { isOwner: false, reason: "server-error" };
  }
}

// 验证书签所有权
export async function validateItemOwnership(
  item_uuid: string,
  user_uuid?: string
): Promise<BookmarkOwnershipResult> {
  try {
    // 获取书签信息
    const item = await findBookmarkItemByUuid(item_uuid);

    if (!item) {
      return { isOwner: false, reason: "item-not-found" };
    }

    // 如果没有提供用户UUID，则不是所有者
    if (!user_uuid) {
      return { isOwner: false, reason: "not-authenticated" };
    }

    // 验证所有权
    if (item.user_uuid !== user_uuid) {
      return { isOwner: false, reason: "not-owner" };
    }

    return { isOwner: true };
  } catch (error) {
    console.error("Error validating item ownership:", error);
    return { isOwner: false, reason: "server-error" };
  }
}

// 获取当前用户的UUID（服务器端）
export async function getCurrentUserUuid(): Promise<string | undefined> {
  try {
    // 首先尝试使用 auth() 获取会话
    const session = await auth();

    if (session?.user?.uuid) {
      return session.user.uuid;
    }

    if (session?.user?.id) {
      return session.user.id;
    }

    // 如果会话中没有UUID，尝试使用getUserUuid函数
    try {
      const uuid = await getUserUuid();
      return uuid;
    } catch (error) {
      if (error instanceof Error && error.message.includes("headers")) {
        const clientUuid = await getCurrentUserUuidClient();
        return clientUuid;
      }
      console.error("Error in getUserUuid:", error);
    }

    return undefined;
  } catch (error) {
    console.error("Error getting current user UUID:", error);
    return undefined;
  }
}

// 获取当前用户的UUID（客户端）
export async function getCurrentUserUuidClient(): Promise<string | undefined> {
  try {
    const session = await auth();

    // 首先尝试从uuid字段获取
    if (session?.user?.uuid) {
      return session.user.uuid;
    }

    // 如果没有uuid字段，尝试从id字段获取
    if (session?.user?.id) {
      return session.user.id;
    }

    // 如果都没有，返回undefined
    return undefined;
  } catch (error) {
    console.error("Error getting current user UUID:", error);
    return undefined;
  }
}
