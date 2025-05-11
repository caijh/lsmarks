import {
  BookmarkSubcategory,
  BookmarkSubcategoryFormData,
  BookmarkSubcategoryWithItems
} from "@/types/bookmark/subcategory";
import {
  insertBookmarkSubcategory,
  updateBookmarkSubcategory,
  deleteBookmarkSubcategory,
  findBookmarkSubcategoryByUuid,
  findBookmarkSubcategoriesByCategoryUuid,
  reorderBookmarkSubcategories,
  countBookmarkSubcategoriesByCategoryUuid
} from "@/models/bookmark/subcategory";
import { findBookmarkItemsBySubcategoryUuid } from "@/models/bookmark/item";
import { validateSubcategoryOwnership, validateCategoryOwnership } from "./auth";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";

// 创建新子分类
export async function createBookmarkSubcategory(
  formData: BookmarkSubcategoryFormData,
  user_uuid: string
): Promise<BookmarkSubcategory | undefined> {
  try {
    // 验证分类所有权
    const ownershipResult = await validateCategoryOwnership(formData.category_uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return undefined;
    }

    // 获取当前最大的order_index
    const subcategories = await findBookmarkSubcategoriesByCategoryUuid(formData.category_uuid);
    const maxOrderIndex = subcategories.length > 0
      ? Math.max(...subcategories.map(c => c.order_index))
      : -1;

    // 创建子分类对象
    const subcategory: BookmarkSubcategory = {
      uuid: getUuid(),
      name: formData.name,
      category_uuid: formData.category_uuid,
      user_uuid: user_uuid,
      order_index: formData.order_index !== undefined ? formData.order_index : maxOrderIndex + 1,
      created_at: getIsoTimestr(),
      updated_at: getIsoTimestr()
    };

    // 插入数据库
    await insertBookmarkSubcategory(subcategory);

    return subcategory;
  } catch (error) {
    console.error("Error creating bookmark subcategory:", error);
    return undefined;
  }
}

// 更新子分类
export async function updateBookmarkSubcategoryById(
  uuid: string,
  formData: BookmarkSubcategoryFormData,
  user_uuid: string
): Promise<BookmarkSubcategory | undefined> {
  try {
    // 验证所有权
    const ownershipResult = await validateSubcategoryOwnership(uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return undefined;
    }

    // 更新子分类
    const updateData: Partial<BookmarkSubcategory> = {
      name: formData.name,
      updated_at: getIsoTimestr()
    };

    if (formData.order_index !== undefined) {
      updateData.order_index = formData.order_index;
    }

    await updateBookmarkSubcategory(uuid, updateData);

    // 获取更新后的子分类
    return await findBookmarkSubcategoryByUuid(uuid);
  } catch (error) {
    console.error("Error updating bookmark subcategory:", error);
    return undefined;
  }
}

// 删除子分类
export async function deleteBookmarkSubcategoryById(
  uuid: string,
  user_uuid: string
): Promise<boolean> {
  try {
    // 验证所有权
    const ownershipResult = await validateSubcategoryOwnership(uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return false;
    }

    // 删除子分类
    await deleteBookmarkSubcategory(uuid);

    return true;
  } catch (error) {
    console.error("Error deleting bookmark subcategory:", error);
    return false;
  }
}

// 获取子分类详情
export async function getBookmarkSubcategoryDetails(
  uuid: string
): Promise<BookmarkSubcategory | undefined> {
  try {
    return await findBookmarkSubcategoryByUuid(uuid);
  } catch (error) {
    console.error("Error getting bookmark subcategory details:", error);
    return undefined;
  }
}

// 获取子分类详情（包含书签）
export async function getBookmarkSubcategoryWithItems(
  uuid: string
): Promise<BookmarkSubcategoryWithItems | undefined> {
  try {
    const subcategory = await findBookmarkSubcategoryByUuid(uuid);

    if (!subcategory) {
      return undefined;
    }

    // 获取书签
    const items = await findBookmarkItemsBySubcategoryUuid(uuid);

    return {
      ...subcategory,
      items
    };
  } catch (error) {
    console.error("Error getting bookmark subcategory with items:", error);
    return undefined;
  }
}

// 获取分类的所有子分类
export async function getBookmarkSubcategoriesByCategory(
  category_uuid: string,
  page: number = 1,
  limit: number = 50
): Promise<BookmarkSubcategory[]> {
  try {
    return await findBookmarkSubcategoriesByCategoryUuid(category_uuid, page, limit);
  } catch (error) {
    console.error("Error getting bookmark subcategories by category:", error);
    return [];
  }
}

// 获取分类的所有子分类（包含书签）
export async function getBookmarkSubcategoriesWithItems(
  category_uuid: string
): Promise<BookmarkSubcategoryWithItems[]> {
  try {
    const subcategories = await findBookmarkSubcategoriesByCategoryUuid(category_uuid);

    // 获取每个子分类的书签
    const subcategoriesWithItems = await Promise.all(
      subcategories.map(async (subcategory) => {
        const items = await findBookmarkItemsBySubcategoryUuid(subcategory.uuid);
        return {
          ...subcategory,
          items
        };
      })
    );

    return subcategoriesWithItems;
  } catch (error) {
    console.error("Error getting bookmark subcategories with items:", error);
    return [];
  }
}

// 重新排序子分类
export async function reorderBookmarkSubcategoriesById(
  subcategories: { uuid: string; order_index: number }[],
  user_uuid: string
): Promise<boolean> {
  try {
    // 验证所有权（验证第一个子分类的所有权）
    if (subcategories.length === 0) {
      return true;
    }

    const ownershipResult = await validateSubcategoryOwnership(subcategories[0].uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return false;
    }

    // 重新排序
    return await reorderBookmarkSubcategories(subcategories);
  } catch (error) {
    console.error("Error reordering bookmark subcategories:", error);
    return false;
  }
}

// 获取分类的子分类数量
export async function getBookmarkSubcategoryCount(
  category_uuid: string
): Promise<number> {
  try {
    return await countBookmarkSubcategoriesByCategoryUuid(category_uuid);
  } catch (error) {
    console.error("Error getting bookmark subcategory count:", error);
    return 0;
  }
}
