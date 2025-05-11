import { BookmarkItem } from "./item";

export interface BookmarkSubcategory {
  id?: number;
  uuid: string;
  name: string;
  description?: string;
  category_uuid: string;
  user_uuid: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  is_temp?: boolean; // 标记是否为临时项目，用于乐观更新
}

export interface BookmarkSubcategoryFormData {
  name: string;
  description?: string;
  category_uuid: string;
  order_index?: number;
}

export interface BookmarkSubcategoryWithItems extends BookmarkSubcategory {
  items?: BookmarkItem[];
}
