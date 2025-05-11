import { BookmarkSubcategory } from "@/types/bookmark/subcategory";
import { getSupabaseClient } from "@/models/db";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";

export async function insertBookmarkSubcategory(subcategory: BookmarkSubcategory) {
  const supabase = getSupabaseClient();
  
  // 确保有UUID
  if (!subcategory.uuid) {
    subcategory.uuid = getUuid();
  }
  
  // 设置创建和更新时间
  const now = getIsoTimestr();
  if (!subcategory.created_at) {
    subcategory.created_at = now;
  }
  if (!subcategory.updated_at) {
    subcategory.updated_at = now;
  }
  
  const { data, error } = await supabase
    .from("bookmark_subcategories")
    .insert(subcategory);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBookmarkSubcategory(uuid: string, subcategory: Partial<BookmarkSubcategory>) {
  const supabase = getSupabaseClient();
  
  // 设置更新时间
  subcategory.updated_at = getIsoTimestr();
  
  const { data, error } = await supabase
    .from("bookmark_subcategories")
    .update(subcategory)
    .eq("uuid", uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteBookmarkSubcategory(uuid: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_subcategories")
    .delete()
    .eq("uuid", uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function findBookmarkSubcategoryByUuid(uuid: string): Promise<BookmarkSubcategory | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_subcategories")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findBookmarkSubcategoriesByCategoryUuid(
  category_uuid: string,
  page: number = 1,
  limit: number = 50
): Promise<BookmarkSubcategory[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookmark_subcategories")
    .select("*")
    .eq("category_uuid", category_uuid)
    .order("order_index", { ascending: true })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return [];
  }

  return data;
}

export async function reorderBookmarkSubcategories(
  subcategories: { uuid: string; order_index: number }[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  try {
    // 使用事务确保所有更新都成功或都失败
    for (const subcategory of subcategories) {
      const { error } = await supabase
        .from("bookmark_subcategories")
        .update({ order_index: subcategory.order_index, updated_at: getIsoTimestr() })
        .eq("uuid", subcategory.uuid);
      
      if (error) {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Failed to reorder subcategories:", error);
    return false;
  }
}

export async function countBookmarkSubcategoriesByCategoryUuid(category_uuid: string): Promise<number> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from("bookmark_subcategories")
    .select("*", { count: "exact", head: true })
    .eq("category_uuid", category_uuid);

  if (error) {
    return 0;
  }

  return count || 0;
}
