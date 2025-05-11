export interface BookmarkItem {
  id?: number;
  uuid: string;
  title: string;
  url: string;
  normalized_url?: string;
  description?: string;
  icon_url?: string;
  subcategory_uuid: string;
  category_uuid?: string; // 添加分类UUID
  user_uuid: string;
  order_index: number;
  add_count?: number;
  created_at: string;
  updated_at: string;
  is_temp?: boolean; // 标记是否为临时项目，用于乐观更新
}

export interface BookmarkItemFormData {
  title: string;
  url: string;
  description?: string;
  icon_url?: string;
  subcategory_uuid: string;
  order_index?: number;
}
