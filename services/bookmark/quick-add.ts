import { BookmarkItem } from "@/types/bookmark/item";
import { getSupabaseClient } from "@/models/db";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { validateCollectionOwnership } from "./auth";

// 快速添加书签的请求数据类型
interface QuickAddBookmarkRequest {
  // 书签信息
  title: string;
  url: string;
  description?: string;
  icon_url?: string;

  // 分类信息
  category_uuid?: string;
  new_category_name?: string;
  use_new_category: boolean;

  // 子分类信息
  subcategory_uuid?: string;
  new_subcategory_name?: string;
  use_new_subcategory: boolean;

  // 集合信息
  collection_uuid: string;
}

/**
 * 优化的快速添加书签函数，使用批处理减少数据库往返
 */
export async function quickAddBookmark(
  data: QuickAddBookmarkRequest,
  user_uuid: string
): Promise<{
  success: boolean;
  item?: BookmarkItem;
  category_uuid?: string;
  subcategory_uuid?: string;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  
  try {
    // 1. 验证集合所有权（只需验证一次）
    const ownershipResult = await validateCollectionOwnership(data.collection_uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return { 
        success: false, 
        error: ownershipResult.reason || "Not authorized to access this collection" 
      };
    }
    
    // 2. 处理分类
    let categoryUuid = data.category_uuid;
    
    if (data.use_new_category && data.new_category_name) {
      // 获取当前最大的order_index（单次查询）
      const { data: categories, error: catError } = await supabase
        .from("bookmark_categories")
        .select("order_index")
        .eq("collection_uuid", data.collection_uuid)
        .order("order_index", { ascending: false })
        .limit(1);
      
      if (catError) {
        console.error("Error getting max category order:", catError);
        return { success: false, error: "Failed to get category order" };
      }
      
      const maxOrderIndex = categories.length > 0 ? categories[0].order_index : -1;
      
      // 创建新分类
      const category = {
        uuid: getUuid(),
        name: data.new_category_name,
        collection_uuid: data.collection_uuid,
        user_uuid: user_uuid,
        order_index: maxOrderIndex + 1,
        created_at: getIsoTimestr(),
        updated_at: getIsoTimestr()
      };
      
      // 插入新分类
      const { error: insertError } = await supabase
        .from("bookmark_categories")
        .insert(category);
      
      if (insertError) {
        console.error("Error inserting category:", insertError);
        return { success: false, error: "Failed to create category" };
      }
      
      categoryUuid = category.uuid;
    } else if (!categoryUuid) {
      return { success: false, error: "Category UUID is required when not creating a new category" };
    }
    
    // 3. 处理子分类
    let subcategoryUuid = data.subcategory_uuid;
    
    if (data.use_new_subcategory && data.new_subcategory_name) {
      // 获取当前最大的order_index（单次查询）
      const { data: subcategories, error: subError } = await supabase
        .from("bookmark_subcategories")
        .select("order_index")
        .eq("category_uuid", categoryUuid)
        .order("order_index", { ascending: false })
        .limit(1);
      
      if (subError) {
        console.error("Error getting max subcategory order:", subError);
        return { success: false, error: "Failed to get subcategory order" };
      }
      
      const maxOrderIndex = subcategories.length > 0 ? subcategories[0].order_index : -1;
      
      // 创建新子分类
      const subcategory = {
        uuid: getUuid(),
        name: data.new_subcategory_name,
        category_uuid: categoryUuid,
        user_uuid: user_uuid,
        order_index: maxOrderIndex + 1,
        created_at: getIsoTimestr(),
        updated_at: getIsoTimestr()
      };
      
      // 插入新子分类
      const { error: insertError } = await supabase
        .from("bookmark_subcategories")
        .insert(subcategory);
      
      if (insertError) {
        console.error("Error inserting subcategory:", insertError);
        return { success: false, error: "Failed to create subcategory" };
      }
      
      subcategoryUuid = subcategory.uuid;
    } else if (!subcategoryUuid) {
      return { success: false, error: "Subcategory UUID is required when not creating a new subcategory" };
    }
    
    // 4. 创建书签
    // 获取当前最大的order_index（单次查询）
    const { data: items, error: itemError } = await supabase
      .from("bookmark_items")
      .select("order_index")
      .eq("subcategory_uuid", subcategoryUuid)
      .order("order_index", { ascending: false })
      .limit(1);
    
    if (itemError) {
      console.error("Error getting max item order:", itemError);
      return { success: false, error: "Failed to get item order" };
    }
    
    const maxOrderIndex = items.length > 0 ? items[0].order_index : -1;
    
    // 创建书签对象
    const item: BookmarkItem = {
      uuid: getUuid(),
      title: data.title,
      url: data.url,
      description: data.description,
      icon_url: data.icon_url,
      subcategory_uuid: subcategoryUuid,
      user_uuid: user_uuid,
      order_index: maxOrderIndex + 1,
      created_at: getIsoTimestr(),
      updated_at: getIsoTimestr()
    };
    
    // 插入书签
    const { error: insertError } = await supabase
      .from("bookmark_items")
      .insert(item);
    
    if (insertError) {
      console.error("Error inserting bookmark item:", insertError);
      return { success: false, error: "Failed to create bookmark item" };
    }
    
    return {
      success: true,
      item,
      category_uuid: categoryUuid,
      subcategory_uuid: subcategoryUuid
    };
  } catch (error) {
    console.error("Error in quickAddBookmark:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
