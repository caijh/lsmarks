import {
  BookmarkItem,
  BookmarkItemFormData
} from "@/types/bookmark/item";
import {
  insertBookmarkItem,
  updateBookmarkItem,
  deleteBookmarkItem,
  findBookmarkItemByUuid,
  findBookmarkItemsBySubcategoryUuid,
  reorderBookmarkItems
} from "@/models/bookmark/item";
import { validateItemOwnership, validateSubcategoryOwnership } from "./auth";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { getSupabaseClient, releaseSupabaseClient } from "@/models/db";

// 创建新书签
export async function createBookmarkItem(
  formData: BookmarkItemFormData,
  user_uuid: string
): Promise<BookmarkItem | undefined> {
  try {
    // 验证子分类所有权
    const ownershipResult = await validateSubcategoryOwnership(formData.subcategory_uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return undefined;
    }

    // 获取当前最大的order_index
    const items = await findBookmarkItemsBySubcategoryUuid(formData.subcategory_uuid);
    const maxOrderIndex = items.length > 0
      ? Math.max(...items.map(i => i.order_index))
      : -1;

    // 创建书签对象
    const item: BookmarkItem = {
      uuid: getUuid(),
      title: formData.title,
      url: formData.url,
      icon_url: formData.icon_url,
      subcategory_uuid: formData.subcategory_uuid,
      user_uuid: user_uuid,
      order_index: formData.order_index !== undefined ? formData.order_index : maxOrderIndex + 1,
      created_at: getIsoTimestr(),
      updated_at: getIsoTimestr()
    };

    // 插入数据库
    await insertBookmarkItem(item);

    return item;
  } catch (error) {
    console.error("Error creating bookmark item:", error);
    return undefined;
  }
}

// 更新书签
export async function updateBookmarkItemById(
  uuid: string,
  formData: BookmarkItemFormData,
  user_uuid: string
): Promise<BookmarkItem | undefined> {
  try {
    // 验证所有权
    const ownershipResult = await validateItemOwnership(uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return undefined;
    }

    // 更新书签
    const updateData: Partial<BookmarkItem> = {
      title: formData.title,
      url: formData.url,
      icon_url: formData.icon_url,
      updated_at: getIsoTimestr()
    };

    if (formData.order_index !== undefined) {
      updateData.order_index = formData.order_index;
    }

    await updateBookmarkItem(uuid, updateData);

    // 获取更新后的书签
    return await findBookmarkItemByUuid(uuid);
  } catch (error) {
    console.error("Error updating bookmark item:", error);
    return undefined;
  }
}

// 删除书签
export async function deleteBookmarkItemById(
  uuid: string,
  user_uuid: string
): Promise<boolean> {
  try {
    // 验证所有权
    const ownershipResult = await validateItemOwnership(uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return false;
    }

    // 删除书签
    await deleteBookmarkItem(uuid);

    return true;
  } catch (error) {
    console.error("Error deleting bookmark item:", error);
    return false;
  }
}

// 获取书签详情
export async function getBookmarkItemDetails(
  uuid: string
): Promise<BookmarkItem | undefined> {
  try {
    return await findBookmarkItemByUuid(uuid);
  } catch (error) {
    console.error("Error getting bookmark item details:", error);
    return undefined;
  }
}

// 获取子分类的所有书签
export async function getBookmarkItemsBySubcategory(
  subcategory_uuid: string,
  page: number = 1,
  limit: number = 100
): Promise<BookmarkItem[]> {
  try {
    return await findBookmarkItemsBySubcategoryUuid(subcategory_uuid, page, limit);
  } catch (error) {
    console.error("Error getting bookmark items by subcategory:", error);
    return [];
  }
}

// 重新排序书签
export async function reorderBookmarkItemsById(
  items: { uuid: string; order_index: number }[],
  user_uuid: string
): Promise<boolean> {
  try {
    // 验证所有权（验证第一个书签的所有权）
    if (items.length === 0) {
      return true;
    }

    const ownershipResult = await validateItemOwnership(items[0].uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return false;
    }

    // 重新排序
    return await reorderBookmarkItems(items);
  } catch (error) {
    console.error("Error reordering bookmark items:", error);
    return false;
  }
}

// 获取子分类的书签数量函数已移除，使用getUserBookmarkUsage代替

// 获取集合的所有书签
export async function getBookmarkItemsByCollection(
  collection_uuid: string
): Promise<BookmarkItem[]> {
  try {
    const supabase = getSupabaseClient();

    try {
      // 使用更高效的查询方式，直接获取所有书签并包含必要的关联信息
      const { data, error } = await supabase
        .from("bookmark_items")
        .select(`
          *,
          bookmark_subcategories!inner (
            uuid,
            category_uuid,
            bookmark_categories!inner (
              uuid
            )
          )
        `)
        .eq("bookmark_subcategories.bookmark_categories.collection_uuid", collection_uuid)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching bookmarks by collection:", error);
        return [];
      }

      // 处理结果，添加分类UUID
      const bookmarks: BookmarkItem[] = data.map(item => ({
        ...item,
        category_uuid: item.bookmark_subcategories.category_uuid
      }));

      return bookmarks;
    } finally {
      // 释放连接
      releaseSupabaseClient(supabase);
    }
  } catch (error) {
    console.error("Error getting bookmark items by collection:", error);
    return [];
  }
}
