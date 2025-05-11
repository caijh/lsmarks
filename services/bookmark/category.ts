import {
  BookmarkCategory,
  BookmarkCategoryFormData,
  BookmarkCategoryWithSubcategories
} from "@/types/bookmark/category";
import {
  insertBookmarkCategory,
  updateBookmarkCategory,
  deleteBookmarkCategory,
  findBookmarkCategoryByUuid,
  findBookmarkCategoriesByCollectionUuid,
  reorderBookmarkCategories,
  countBookmarkCategoriesByCollectionUuid
} from "@/models/bookmark/category";
import { findBookmarkSubcategoriesByCategoryUuid } from "@/models/bookmark/subcategory";
import { findBookmarkItemsBySubcategoryUuid } from "@/models/bookmark/item";
import { validateCategoryOwnership, validateCollectionOwnership } from "./auth";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { getSupabaseClient, releaseSupabaseClient } from "@/models/db";

// 创建新分类
export async function createBookmarkCategory(
  formData: BookmarkCategoryFormData,
  user_uuid: string
): Promise<BookmarkCategory | undefined> {
  try {
    // 验证集合所有权
    const ownershipResult = await validateCollectionOwnership(formData.collection_uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return undefined;
    }

    // 获取当前最大的order_index
    const categories = await findBookmarkCategoriesByCollectionUuid(formData.collection_uuid);
    const maxOrderIndex = categories.length > 0
      ? Math.max(...categories.map(c => c.order_index))
      : -1;

    // 创建分类对象
    const category: BookmarkCategory = {
      uuid: getUuid(),
      name: formData.name,
      collection_uuid: formData.collection_uuid,
      user_uuid: user_uuid,
      order_index: formData.order_index !== undefined ? formData.order_index : maxOrderIndex + 1,
      created_at: getIsoTimestr(),
      updated_at: getIsoTimestr()
    };

    // 插入数据库
    await insertBookmarkCategory(category);

    return category;
  } catch (error) {
    console.error("Error creating bookmark category:", error);
    return undefined;
  }
}

// 更新分类
export async function updateBookmarkCategoryById(
  uuid: string,
  formData: BookmarkCategoryFormData,
  user_uuid: string
): Promise<BookmarkCategory | undefined> {
  try {
    // 验证所有权
    const ownershipResult = await validateCategoryOwnership(uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return undefined;
    }

    // 更新分类
    const updateData: Partial<BookmarkCategory> = {
      name: formData.name,
      updated_at: getIsoTimestr()
    };

    if (formData.order_index !== undefined) {
      updateData.order_index = formData.order_index;
    }

    await updateBookmarkCategory(uuid, updateData);

    // 获取更新后的分类
    return await findBookmarkCategoryByUuid(uuid);
  } catch (error) {
    console.error("Error updating bookmark category:", error);
    return undefined;
  }
}

// 删除分类
export async function deleteBookmarkCategoryById(
  uuid: string,
  user_uuid: string
): Promise<boolean> {
  try {
    // 验证所有权
    const ownershipResult = await validateCategoryOwnership(uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return false;
    }

    // 删除分类
    await deleteBookmarkCategory(uuid);

    return true;
  } catch (error) {
    console.error("Error deleting bookmark category:", error);
    return false;
  }
}

// 获取分类详情
export async function getBookmarkCategoryDetails(
  uuid: string
): Promise<BookmarkCategory | undefined> {
  try {
    return await findBookmarkCategoryByUuid(uuid);
  } catch (error) {
    console.error("Error getting bookmark category details:", error);
    return undefined;
  }
}

// 获取分类详情（包含子分类）
export async function getBookmarkCategoryWithSubcategories(
  uuid: string
): Promise<BookmarkCategoryWithSubcategories | undefined> {
  try {
    const category = await findBookmarkCategoryByUuid(uuid);

    if (!category) {
      return undefined;
    }

    // 获取子分类
    const subcategories = await findBookmarkSubcategoriesByCategoryUuid(uuid);

    return {
      ...category,
      subcategories
    };
  } catch (error) {
    console.error("Error getting bookmark category with subcategories:", error);
    return undefined;
  }
}

// 获取集合的所有分类
export async function getBookmarkCategoriesByCollection(
  collection_uuid: string,
  page: number = 1,
  limit: number = 50
): Promise<BookmarkCategory[]> {
  try {
    return await findBookmarkCategoriesByCollectionUuid(collection_uuid, page, limit);
  } catch (error) {
    console.error("Error getting bookmark categories by collection:", error);
    return [];
  }
}

// 获取集合的所有分类（包含子分类和书签）
export async function getBookmarkCategoriesWithSubcategories(
  collection_uuid: string
): Promise<BookmarkCategoryWithSubcategories[]> {
  // 使用更简单的方法，分步获取数据
  try {
    // 1. 获取分类
    const categories = await findBookmarkCategoriesByCollectionUuid(collection_uuid);

    if (!categories || categories.length === 0) {
      return [];
    }

    // 2. 为每个分类获取子分类和书签
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        // 获取子分类
        const subcategories = await findBookmarkSubcategoriesByCategoryUuid(category.uuid);

        // 获取每个子分类的书签
        const subcategoriesWithItems = await Promise.all(
          subcategories.map(async (subcategory) => {
            const items = await findBookmarkItemsBySubcategoryUuid(subcategory.uuid);
            return {
              ...subcategory,
              items: items || []
            };
          })
        );

        // 按照order_index排序
        const sortedSubcategories = subcategoriesWithItems.sort((a, b) =>
          (a.order_index || 0) - (b.order_index || 0)
        );

        return {
          ...category,
          subcategories: sortedSubcategories
        };
      })
    );

    return categoriesWithSubcategories;
  } catch (error) {
    console.error("Error getting bookmark categories with subcategories:", error);
    return [];
  }
}

// 重新排序分类
export async function reorderBookmarkCategoriesById(
  categories: { uuid: string; order_index: number }[],
  user_uuid: string
): Promise<boolean> {
  try {
    // 验证所有权（验证第一个分类的所有权）
    if (categories.length === 0) {
      return true;
    }

    const ownershipResult = await validateCategoryOwnership(categories[0].uuid, user_uuid);
    if (!ownershipResult.isOwner) {
      return false;
    }

    // 重新排序
    return await reorderBookmarkCategories(categories);
  } catch (error) {
    console.error("Error reordering bookmark categories:", error);
    return false;
  }
}

// 获取集合的分类数量
export async function getBookmarkCategoryCount(
  collection_uuid: string
): Promise<number> {
  try {
    return await countBookmarkCategoriesByCollectionUuid(collection_uuid);
  } catch (error) {
    console.error("Error getting bookmark category count:", error);
    return 0;
  }
}
