export interface BookmarkCollection {
  id?: number;
  uuid: string;
  name: string;
  description?: string;
  is_public: boolean;
  user_uuid: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  cover_url?: string;
}

export interface BookmarkCollectionWithStats extends BookmarkCollection {
  category_count?: number;
  user_username?: string; // 添加用户名
}

export interface BookmarkCollectionFormData {
  name: string;
  description?: string;
  is_public: boolean;
  slug?: string;
  cover_url?: string;
}
