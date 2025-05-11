import { BookmarkItem } from "@/types/bookmark/item";
import { getSupabaseClient, releaseSupabaseClient } from "@/models/db";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";

export async function insertBookmarkItem(item: BookmarkItem) {
  const supabase = getSupabaseClient();

  // 确保有UUID
  if (!item.uuid) {
    item.uuid = getUuid();
  }

  // 设置创建和更新时间
  const now = getIsoTimestr();
  if (!item.created_at) {
    item.created_at = now;
  }
  if (!item.updated_at) {
    item.updated_at = now;
  }

  const { data, error } = await supabase
    .from("bookmark_items")
    .insert(item);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBookmarkItem(uuid: string, item: Partial<BookmarkItem>) {
  const supabase = getSupabaseClient();

  // 设置更新时间
  item.updated_at = getIsoTimestr();

  const { data, error } = await supabase
    .from("bookmark_items")
    .update(item)
    .eq("uuid", uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteBookmarkItem(uuid: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_items")
    .delete()
    .eq("uuid", uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function findBookmarkItemByUuid(uuid: string): Promise<BookmarkItem | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_items")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findBookmarkItemsBySubcategoryUuid(
  subcategory_uuid: string,
  page: number = 1,
  limit: number = 100
): Promise<BookmarkItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_items")
    .select("*")
    .eq("subcategory_uuid", subcategory_uuid)
    .order("order_index", { ascending: true })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return [];
  }

  return data;
}

export async function reorderBookmarkItems(
  items: { uuid: string; order_index: number }[]
): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    // 如果没有项目，直接返回成功
    if (items.length === 0) {
      return true;
    }

    // 获取第一个项目的子分类UUID，用于验证所有项目是否属于同一子分类
    const firstItem = await findBookmarkItemByUuid(items[0].uuid);
    if (!firstItem) {
      throw new Error("First item not found");
    }

    const subcategoryUuid = firstItem.subcategory_uuid;

    // 使用批量更新 - 一次性更新所有项目
    // 注意：Supabase 不支持真正的批量更新，所以我们使用事务模式
    const now = getIsoTimestr();

    // 开始批量更新
    const updatePromises = items.map(item =>
      supabase
        .from("bookmark_items")
        .update({
          order_index: item.order_index,
          updated_at: now
        })
        .eq("uuid", item.uuid)
        .eq("subcategory_uuid", subcategoryUuid) // 额外的安全检查，确保只更新同一子分类的项目
    );

    // 等待所有更新完成
    const results = await Promise.all(updatePromises);

    // 检查是否有任何错误
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Errors during batch update:", errors);
      throw new Error("Some updates failed");
    }

    return true;
  } catch (error) {
    console.error("Failed to reorder items:", error);
    return false;
  }
}

// 已删除 countBookmarkItemsBySubcategoryUuid 函数，使用 get_user_bookmark_usage 存储过程代替
// 已删除 countBookmarkItemsByCollectionUuid 函数，不再需要计算书签数量
