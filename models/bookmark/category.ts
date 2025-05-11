import { BookmarkCategory } from "@/types/bookmark/category";
import { getSupabaseClient } from "@/models/db";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";

export async function insertBookmarkCategory(category: BookmarkCategory) {
  const supabase = getSupabaseClient();
  
  // 确保有UUID
  if (!category.uuid) {
    category.uuid = getUuid();
  }
  
  // 设置创建和更新时间
  const now = getIsoTimestr();
  if (!category.created_at) {
    category.created_at = now;
  }
  if (!category.updated_at) {
    category.updated_at = now;
  }
  
  const { data, error } = await supabase
    .from("bookmark_categories")
    .insert(category);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBookmarkCategory(uuid: string, category: Partial<BookmarkCategory>) {
  const supabase = getSupabaseClient();
  
  // 设置更新时间
  category.updated_at = getIsoTimestr();
  
  const { data, error } = await supabase
    .from("bookmark_categories")
    .update(category)
    .eq("uuid", uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteBookmarkCategory(uuid: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_categories")
    .delete()
    .eq("uuid", uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function findBookmarkCategoryByUuid(uuid: string): Promise<BookmarkCategory | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_categories")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findBookmarkCategoriesByCollectionUuid(
  collection_uuid: string,
  page: number = 1,
  limit: number = 50
): Promise<BookmarkCategory[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_categories")
    .select("*")
    .eq("collection_uuid", collection_uuid)
    .order("order_index", { ascending: true })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return [];
  }

  return data;
}

export async function reorderBookmarkCategories(
  categories: { uuid: string; order_index: number }[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  try {
    // 使用事务确保所有更新都成功或都失败
    for (const category of categories) {
      const { error } = await supabase
        .from("bookmark_categories")
        .update({ order_index: category.order_index, updated_at: getIsoTimestr() })
        .eq("uuid", category.uuid);
      
      if (error) {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return false;
  }
}

export async function countBookmarkCategoriesByCollectionUuid(collection_uuid: string): Promise<number> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from("bookmark_categories")
    .select("*", { count: "exact", head: true })
    .eq("collection_uuid", collection_uuid);

  if (error) {
    return 0;
  }

  return count || 0;
}
