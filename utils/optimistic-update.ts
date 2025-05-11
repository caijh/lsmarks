import { BookmarkItem } from "@/types/bookmark/item";
import { BookmarkSubcategoryWithItems } from "@/types/bookmark/subcategory";
import { BookmarkCategoryWithSubcategories } from "@/types/bookmark/category";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";

/**
 * 生成临时UUID
 * 用于乐观更新时创建临时ID
 */
export function generateTempId(): string {
  return `temp_${getUuid()}`;
}

/**
 * 创建临时书签项目
 * 用于乐观更新时在UI中显示
 */
export function createTempBookmarkItem(data: {
  title: string;
  url: string;
  description?: string;
  icon_url?: string;
  subcategory_uuid: string;
  user_uuid: string;
}): BookmarkItem {
  return {
    uuid: generateTempId(),
    title: data.title,
    url: data.url,
    description: data.description || "",
    icon_url: data.icon_url || "",
    subcategory_uuid: data.subcategory_uuid,
    user_uuid: data.user_uuid,
    order_index: 0, // 临时项目放在最前面
    created_at: getIsoTimestr(),
    updated_at: getIsoTimestr(),
    is_temp: true, // 标记为临时项目
  };
}

/**
 * 创建临时子分类
 * 用于乐观更新时在UI中显示
 */
export function createTempSubcategory(data: {
  name: string;
  category_uuid: string;
  user_uuid: string;
}): BookmarkSubcategoryWithItems {
  return {
    uuid: generateTempId(),
    name: data.name,
    category_uuid: data.category_uuid,
    user_uuid: data.user_uuid,
    order_index: 0, // 临时项目放在最前面
    created_at: getIsoTimestr(),
    updated_at: getIsoTimestr(),
    items: [],
    is_temp: true, // 标记为临时项目
  };
}

/**
 * 创建临时分类
 * 用于乐观更新时在UI中显示
 */
export function createTempCategory(data: {
  name: string;
  collection_uuid: string;
  user_uuid: string;
}): BookmarkCategoryWithSubcategories {
  return {
    uuid: generateTempId(),
    name: data.name,
    collection_uuid: data.collection_uuid,
    user_uuid: data.user_uuid,
    order_index: 0, // 临时项目放在最前面
    created_at: getIsoTimestr(),
    updated_at: getIsoTimestr(),
    subcategories: [],
    is_temp: true, // 标记为临时项目
  };
}

/**
 * 更新分类列表中的临时项目
 * 用于将临时项目替换为实际项目
 */
export function updateCategoriesWithRealData(
  categories: BookmarkCategoryWithSubcategories[],
  tempId: string,
  realData: BookmarkCategoryWithSubcategories
): BookmarkCategoryWithSubcategories[] {
  return categories.map(category => {
    if (category.uuid === tempId) {
      return { ...realData };
    }
    return category;
  });
}

/**
 * 更新子分类列表中的临时项目
 * 用于将临时项目替换为实际项目
 */
export function updateSubcategoriesWithRealData(
  categories: BookmarkCategoryWithSubcategories[],
  categoryId: string,
  tempId: string,
  realData: BookmarkSubcategoryWithItems
): BookmarkCategoryWithSubcategories[] {
  return categories.map(category => {
    if (category.uuid === categoryId) {
      return {
        ...category,
        subcategories: category.subcategories?.map(subcategory => {
          if (subcategory.uuid === tempId) {
            return { ...realData };
          }
          return subcategory;
        }) || []
      };
    }
    return category;
  });
}

/**
 * 更新书签列表中的临时项目
 * 用于将临时项目替换为实际项目
 */
export function updateItemsWithRealData(
  categories: BookmarkCategoryWithSubcategories[],
  categoryId: string,
  subcategoryId: string,
  tempId: string,
  realData: BookmarkItem
): BookmarkCategoryWithSubcategories[] {
  return categories.map(category => {
    if (category.uuid === categoryId) {
      return {
        ...category,
        subcategories: category.subcategories?.map(subcategory => {
          if (subcategory.uuid === subcategoryId) {
            return {
              ...subcategory,
              items: subcategory.items?.map(item => {
                if (item.uuid === tempId) {
                  return { ...realData };
                }
                return item;
              }) || []
            };
          }
          return subcategory;
        }) || []
      };
    }
    return category;
  });
}

/**
 * 添加书签到子分类
 * 用于乐观更新时在UI中添加书签
 */
export function addItemToSubcategory(
  categories: BookmarkCategoryWithSubcategories[],
  categoryId: string,
  subcategoryId: string,
  item: BookmarkItem
): BookmarkCategoryWithSubcategories[] {
  return categories.map(category => {
    if (category.uuid === categoryId) {
      return {
        ...category,
        subcategories: category.subcategories?.map(subcategory => {
          if (subcategory.uuid === subcategoryId) {
            return {
              ...subcategory,
              items: [item, ...(subcategory.items || [])]
            };
          }
          return subcategory;
        }) || []
      };
    }
    return category;
  });
}

/**
 * 添加子分类到分类
 * 用于乐观更新时在UI中添加子分类
 */
export function addSubcategoryToCategory(
  categories: BookmarkCategoryWithSubcategories[],
  categoryId: string,
  subcategory: BookmarkSubcategoryWithItems
): BookmarkCategoryWithSubcategories[] {
  return categories.map(category => {
    if (category.uuid === categoryId) {
      return {
        ...category,
        subcategories: [subcategory, ...(category.subcategories || [])]
      };
    }
    return category;
  });
}

/**
 * 添加分类到列表
 * 用于乐观更新时在UI中添加分类
 */
export function addCategoryToList(
  categories: BookmarkCategoryWithSubcategories[],
  category: BookmarkCategoryWithSubcategories
): BookmarkCategoryWithSubcategories[] {
  return [category, ...categories];
}
