import { BookmarkCollection } from "@/types/bookmark/collection";
import { getSupabaseClient, releaseSupabaseClient } from "@/models/db";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";

export enum BookmarkCollectionStatus {
  Public = "public",
  Private = "private",
}

export async function insertBookmarkCollection(collection: BookmarkCollection) {
  const supabase = getSupabaseClient();

  try {
    // 确保有UUID
    if (!collection.uuid) {
      collection.uuid = getUuid();
    }

    // 设置创建和更新时间
    const now = getIsoTimestr();
    if (!collection.created_at) {
      collection.created_at = now;
    }
    if (!collection.updated_at) {
      collection.updated_at = now;
    }

    console.log("Inserting collection into database:", collection);

    const { data, error } = await supabase
      .from("bookmark_collections")
      .insert(collection);

    if (error) {
      console.error("Error inserting bookmark collection:", error);
      throw error;
    }

    return data;
  } finally {
    // 释放连接
    releaseSupabaseClient(supabase);
  }
}

export async function updateBookmarkCollection(uuid: string, collection: Partial<BookmarkCollection>) {
  const supabase = getSupabaseClient();

  try {
    // 设置更新时间
    collection.updated_at = getIsoTimestr();

    const { data, error } = await supabase
      .from("bookmark_collections")
      .update(collection)
      .eq("uuid", uuid);

    if (error) {
      console.error("Error updating bookmark collection:", error);
      throw error;
    }

    return data;
  } finally {
    // 释放连接
    releaseSupabaseClient(supabase);
  }
}

export async function deleteBookmarkCollection(uuid: string) {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("bookmark_collections")
      .delete()
      .eq("uuid", uuid);

    if (error) {
      console.error("Error deleting bookmark collection:", error);
      throw error;
    }

    return data;
  } finally {
    // 释放连接
    releaseSupabaseClient(supabase);
  }
}

export async function findBookmarkCollectionByUuid(uuid: string): Promise<BookmarkCollection | undefined> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("bookmark_collections")
      .select("*")
      .eq("uuid", uuid)
      .single();

    if (error) {
      return undefined;
    }

    return data;
  } finally {
    // 释放连接
    releaseSupabaseClient(supabase);
  }
}

export async function findBookmarkCollectionsByUserUuid(
  user_uuid: string,
  page: number = 1,
  limit: number = 20
): Promise<BookmarkCollection[]> {
  const supabase = getSupabaseClient();
  try {
    // 首先获取用户信息
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username")
      .eq("uuid", user_uuid)
      .single();

    if (userError || !userData) {
      return [];
    }

    // 然后获取集合
    const { data, error } = await supabase
      .from("bookmark_collections")
      .select("*")
      .eq("user_uuid", user_uuid)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      return [];
    }

    // 将用户名添加到结果中，如果用户名为 null，使用 uuid 的前8位作为临时用户名
    return data.map(item => ({
      ...item,
      user_username: userData.username || `user_${(user_uuid || "").substring(0, 8)}`
    }));
  } finally {
    // 释放连接
    releaseSupabaseClient(supabase);
  }
}

// 已删除findPublicBookmarkCollections函数

export async function getBookmarkCollectionBySlug(
  username: string,
  slug: string
): Promise<BookmarkCollection | undefined> {
  const supabase = getSupabaseClient();

  // 如果 username 是 "null" 字符串，这可能是一个临时用户名
  if (username === "null") {
    // 尝试直接通过 slug 查找集合
    const { data: collections, error: collectionsError } = await supabase
      .from("bookmark_collections")
      .select("*")
      .eq("slug", slug)
      .limit(1);

    if (collectionsError || !collections || collections.length === 0) {
      return undefined;
    }

    return collections[0];
  }

  // 正常流程：首先查找用户
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("uuid")
    .eq("username", username)
    .single();

  if (userError || !userData) {
    return undefined;
  }

  // 然后查找集合
  const { data, error } = await supabase
    .from("bookmark_collections")
    .select("*")
    .eq("user_uuid", userData.uuid)
    .eq("slug", slug)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

// 已删除getTopPublicBookmarkCollections函数

export async function countBookmarkCollectionsByUserUuid(user_uuid: string): Promise<number> {
  const supabase = getSupabaseClient();
  try {
    const { count, error } = await supabase
      .from("bookmark_collections")
      .select("*", { count: "exact", head: true })
      .eq("user_uuid", user_uuid);

    if (error) {
      return 0;
    }

    return count || 0;
  } finally {
    // 释放连接
    releaseSupabaseClient(supabase);
  }
}

// 已删除countPublicBookmarkCollections和countPublicBookmarkCollectionsByUserUuid函数


