import { UserLevel, UserLevelInfo } from "@/types/user-level";
import { getSupabaseClient, releaseSupabaseClient } from "./db";

// 获取所有用户等级
export async function getAllUserLevels(): Promise<UserLevel[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_levels")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching user levels:", error);
    return [];
  }

  return data || [];
}

// 根据等级代码获取用户等级
export async function getUserLevelByCode(levelCode: string): Promise<UserLevel | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_levels")
    .select("*")
    .eq("level_code", levelCode)
    .single();

  if (error) {
    console.error(`Error fetching user level with code ${levelCode}:`, error);
    return null;
  }

  return data;
}

// 获取用户的等级信息
export async function getUserLevelInfo(userUuid: string): Promise<UserLevelInfo | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .rpc("get_user_level_info", { user_uuid_param: userUuid });

  if (error) {
    console.error(`Error fetching user level info for user ${userUuid}:`, error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

// 更新用户等级
export async function updateUserLevel(userUuid: string, levelCode: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ user_level: levelCode })
    .eq("uuid", userUuid);

  if (error) {
    console.error(`Error updating user level for user ${userUuid}:`, error);
    return false;
  }

  return true;
}

// 检查用户是否可以创建新的书签集合
export async function canUserCreateCollection(userUuid: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    console.log(`Checking collection limit for user ${userUuid}`);

    const { data, error } = await supabase
      .rpc("check_user_collection_limit", { user_uuid_param: userUuid });

    if (error) {
      console.error(`Error checking collection limit for user ${userUuid}:`, error);
      return false;
    }

    console.log(`Collection limit check result for user ${userUuid}:`, data);

    // 如果没有用户等级限制，默认允许创建
    if (data === null) {
      console.log(`No user level limit found for user ${userUuid}, allowing creation`);
      return true;
    }

    return data || false;
  } finally {
    // 释放连接
    releaseSupabaseClient(supabase);
  }
}

// 检查用户是否可以在特定子分类中创建新的书签
export async function canUserCreateBookmark(subcategoryUuid: string, userUuid: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    console.log(`Checking bookmark limit for user ${userUuid} in subcategory ${subcategoryUuid}`);

    const { data, error } = await supabase
      .rpc("check_user_bookmark_limit", {
        subcategory_uuid_param: subcategoryUuid,
        user_uuid_param: userUuid
      });

    if (error) {
      console.error(`Error checking bookmark limit for user ${userUuid} in subcategory ${subcategoryUuid}:`, error);
      return false;
    }

    console.log(`Bookmark limit check result for user ${userUuid}:`, data);

    // 如果没有用户等级限制，默认允许创建
    if (data === null) {
      console.log(`No user level limit found for user ${userUuid}, allowing bookmark creation`);
      return true;
    }

    return data || false;
  } finally {
    // 释放连接
    releaseSupabaseClient(supabase);
  }
}

// 获取用户的书签使用情况
export async function getUserBookmarkUsage(userUuid: string): Promise<{
  collectionsUsed: number,
  collectionsLimit: number,
  bookmarksUsed: { [collectionUuid: string]: number },
  bookmarksLimit: number
} | null> {
  try {
    const supabase = getSupabaseClient();

    // 获取用户等级信息
    const levelInfo = await getUserLevelInfo(userUuid);
    if (!levelInfo) return null;

    // 获取用户的所有集合
    const { data: collections, error: collectionsError } = await supabase
      .from("bookmark_collections")
      .select("uuid")
      .eq("user_uuid", userUuid);

    if (collectionsError) throw collectionsError;

    // 获取每个集合的书签数量 - 使用单个查询优化性能
    const bookmarksUsed: { [collectionUuid: string]: number } = {};

    // 初始化所有集合的书签数量为0
    (collections || []).forEach(collection => {
      bookmarksUsed[collection.uuid] = 0;
    });

    // 如果有集合，获取书签数量
    if (collections && collections.length > 0) {
      // 使用RPC函数获取用户的书签使用情况
      const { data: usageData, error: usageError } = await supabase
        .rpc('get_user_bookmark_usage', { user_id: userUuid });

      if (!usageError && usageData) {
        // 更新书签使用情况
        usageData.forEach((item: { collection_uuid: string, bookmark_count: number }) => {
          bookmarksUsed[item.collection_uuid] = item.bookmark_count;
        });
      }
    }

    return {
      collectionsUsed: collections?.length || 0,
      collectionsLimit: levelInfo.max_collections,
      bookmarksUsed,
      bookmarksLimit: levelInfo.max_bookmarks_per_collection
    };
  } catch (error) {
    console.error(`Error getting bookmark usage for user ${userUuid}:`, error);
    return null;
  }
}
