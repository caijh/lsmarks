import { BookmarkSubcategoryWithItems } from "./subcategory";

export interface BookmarkCategory {
  id?: number;
  uuid: string;
  name: string;
  description?: string;
  collection_uuid: string;
  user_uuid: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  is_temp?: boolean; // 标记是否为临时项目，用于乐观更新
}

export interface BookmarkCategoryFormData {
  name: string;
  description?: string;
  collection_uuid: string;
  order_index?: number;
}

export interface BookmarkCategoryWithSubcategories extends BookmarkCategory {
  subcategories?: BookmarkSubcategoryWithItems[];
}
