import {
  BookmarkCollection,
  BookmarkCollectionFormData,
  BookmarkCollectionWithStats
} from "@/types/bookmark/collection";
import * as models from "@/models/bookmark/collection";
import { getSupabaseClient, releaseSupabaseClient } from "@/models/db";
import { countBookmarkCategoriesByCollectionUuid } from "@/models/bookmark/category";
import { validateCollectionOwnership, getCurrentUserUuid } from "./auth";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import * as serverCache from "@/lib/server-cache";
import { auth } from "@/auth";

// 确保用户存在于数据库中
async function ensureUserExists(user_uuid: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    console.log(`Checking if user ${user_uuid} exists in database`);

    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("uuid")
      .eq("uuid", user_uuid)
      .single();

    if (checkError) {
      console.log(`Error checking user existence: ${checkError.message}`);
    }

    // 如果用户已存在，返回 true
    if (existingUser) {
      console.log(`User ${user_uuid} already exists in database`);
      return true;
    }

    // 获取当前会话信息
    const session = await auth();
    if (!session || !session.user) {
      console.error("No active session found");
      return false;
    }

    // 创建新用户
    console.log(`User ${user_uuid} does not exist, creating new user record`);

    // 生成用户名 - 使用与URL中相同的格式
    const username = `user_${user_uuid.substring(0, 8)}`;

    // 先检查用户名是否已存在
    const { data: existingUsername, error: usernameError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single();

    if (usernameError) {
      console.log(`Username ${username} is available`);
    } else {
      console.log(`Username ${username} already exists, will use a different one`);
    }

    // 如果用户名已存在，添加随机后缀
    const finalUsername = existingUsername
      ? `user_${user_uuid.substring(0, 6)}_${Math.floor(Math.random() * 1000)}`
      : username;

    console.log(`Using username: ${finalUsername}`);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        uuid: user_uuid,
        email: session.user.email || `${finalUsername}@example.com`,
        nickname: session.user.name || `User_${user_uuid.substring(0, 8)}`,
        username: finalUsername, // 添加username字段
        avatar_url: session.user.image || "",
        created_at: getIsoTimestr(),
        updated_at: getIsoTimestr(),
        user_level: "free"
      })
      .select();

    if (insertError) {
      console.error(`Error creating user: ${insertError.message}`, insertError);
      return false;
    }

    console.log(`User ${user_uuid} created successfully`);
    return true;
  } catch (error) {
    console.error(`Unexpected error in ensureUserExists: ${error}`);
    return false;
  } finally {
    releaseSupabaseClient(supabase);
  }
}

// 创建新集合
export async function createBookmarkCollection(
  formData: BookmarkCollectionFormData,
  user_uuid: string
): Promise<BookmarkCollection | undefined> {
  try {
    console.log(`Creating bookmark collection for user ${user_uuid}:`, formData);

    if (!user_uuid) {
      console.error("Cannot create collection: user_uuid is empty");
      return undefined;
    }

    // 检查用户是否存在，如果不存在则创建
    const userExists = await ensureUserExists(user_uuid);
    if (!userExists) {
      console.error(`User with UUID ${user_uuid} does not exist and could not be created`);
      return undefined;
    }

    // 创建集合对象
    const collection: BookmarkCollection = {
      uuid: getUuid(),
      name: formData.name,
      description: formData.description,
      is_public: formData.is_public,
      user_uuid: user_uuid,
      created_at: getIsoTimestr(),
      updated_at: getIsoTimestr(),
      slug: formData.slug
    };

    console.log("Inserting collection into database:", collection);

    // 插入数据库
    await models.insertBookmarkCollection(collection);

    // 清除所有可能的缓存，确保新集合立即可见
    console.log("Clearing all related caches...");

    // 清除所有页码的缓存
    for (let p = 1; p <= 5; p++) {
      for (let l of [12, 20, 50]) {
        const cacheKey = `user_collections:${user_uuid}:${p}:${l}`;
        serverCache.invalidate(cacheKey);
        console.log(`Cleared cache: ${cacheKey}`);
      }
    }

    // 清除用户集合数量缓存
    const countCacheKey = `user_collections_count:${user_uuid}`;
    serverCache.invalidate(countCacheKey);
    console.log(`Cleared cache: ${countCacheKey}`);

    // 清空整个缓存以确保一致性
    serverCache.clear();
    console.log("Cleared entire server cache");

    console.log("Collection created successfully:", collection.uuid);

    return collection;
  } catch (error) {
    console.error("Error creating bookmark collection:", error);
    // 如果是数据库错误，记录更详细的信息
    if (error && typeof error === 'object' && 'code' in error) {
      console.error(`Database error code: ${(error as any).code}, details:`, error);
    }
    return undefined;
  }
}

// 更新集合
export async function updateBookmarkCollectionById(
  uuid: string,
  formData: BookmarkCollectionFormData,
  user_uuid: string
): Promise<BookmarkCollection | undefined> {
  try {
    // 验证所有权
    const ownershipResult = await validateCollectionOwnership(uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return undefined;
    }

    // 更新集合
    const updateData: Partial<BookmarkCollection> = {
      name: formData.name,
      description: formData.description,
      is_public: formData.is_public,
      updated_at: getIsoTimestr(),
      slug: formData.slug
    };

    await models.updateBookmarkCollection(uuid, updateData);

    // 获取更新后的集合
    return await models.findBookmarkCollectionByUuid(uuid);
  } catch (error) {
    console.error("Error updating bookmark collection:", error);
    return undefined;
  }
}

// 删除集合
export async function deleteBookmarkCollectionById(
  uuid: string,
  user_uuid: string
): Promise<boolean> {
  try {
    // 验证所有权
    const ownershipResult = await validateCollectionOwnership(uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return false;
    }

    // 删除集合
    await models.deleteBookmarkCollection(uuid);

    return true;
  } catch (error) {
    console.error("Error deleting bookmark collection:", error);
    return false;
  }
}

// 获取集合详情
export async function getBookmarkCollectionDetails(
  uuid: string
): Promise<BookmarkCollection | undefined> {
  try {
    return await models.findBookmarkCollectionByUuid(uuid);
  } catch (error) {
    console.error("Error getting bookmark collection details:", error);
    return undefined;
  }
}

// 获取集合详情（包含统计信息）
export async function getBookmarkCollectionWithStats(
  uuid: string
): Promise<BookmarkCollectionWithStats | undefined> {
  try {
    const collection = await models.findBookmarkCollectionByUuid(uuid);

    if (!collection) {
      return undefined;
    }

    // 只获取分类数量统计信息
    const categoryCount = await countBookmarkCategoriesByCollectionUuid(uuid);

    return {
      ...collection,
      category_count: categoryCount
    };
  } catch (error) {
    console.error("Error getting bookmark collection with stats:", error);
    return undefined;
  }
}

// 获取用户的所有集合
export async function getUserBookmarkCollections(
  user_uuid: string,
  page: number = 1,
  limit: number = 20
): Promise<BookmarkCollection[]> {
  try {
    // 使用缓存
    const cacheKey = `user_collections:${user_uuid}:${page}:${limit}`;

    // 先清除缓存，确保获取最新数据
    serverCache.invalidate(cacheKey);
    console.log(`Invalidated cache for key: ${cacheKey}`);

    // 获取最新数据
    const collections = await models.findBookmarkCollectionsByUserUuid(user_uuid, page, limit);
    console.log(`Found ${collections.length} collections for user ${user_uuid}`);

    // 更新缓存
    serverCache.set(cacheKey, collections, 10 * 1000); // 缓存10秒钟

    return collections;
  } catch (error) {
    console.error("Error getting user bookmark collections:", error);
    return [];
  }
}



// 获取公开集合功能已移除

// 通过用户名和slug获取集合
export async function getBookmarkCollectionByUserAndSlug(
  username: string,
  slug: string
): Promise<BookmarkCollectionWithStats | undefined> {
  try {
    const collection = await models.getBookmarkCollectionBySlug(username, slug);

    if (!collection) {
      return undefined;
    }

    // 只获取分类数量统计信息
    const categoryCount = await countBookmarkCategoriesByCollectionUuid(collection.uuid);

    return {
      ...collection,
      category_count: categoryCount
    };
  } catch (error) {
    console.error("Error getting bookmark collection by user and slug:", error);
    return undefined;
  }
}

// 获取热门公开集合功能已移除

// 获取用户集合数量
export async function getUserBookmarkCollectionCount(
  user_uuid: string
): Promise<number> {
  try {
    // 使用缓存
    const cacheKey = `user_collections_count:${user_uuid}`;

    // 先清除缓存，确保获取最新数据
    serverCache.invalidate(cacheKey);
    console.log(`Invalidated cache for key: ${cacheKey}`);

    // 获取最新数据
    const count = await models.countBookmarkCollectionsByUserUuid(user_uuid);
    console.log(`Found ${count} collections count for user ${user_uuid}`);

    // 更新缓存
    serverCache.set(cacheKey, count, 10 * 1000); // 缓存10秒钟

    return count;
  } catch (error) {
    console.error("Error getting user bookmark collection count:", error);
    return 0;
  }
}

// 获取公开集合数量功能已移除
