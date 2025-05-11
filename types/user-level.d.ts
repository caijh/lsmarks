// 用户等级类型定义

export type UserLevelCode = 'free' | 'basic' | 'premium' | 'pro';

export interface UserLevel {
  id?: number;
  level_name: string;
  level_code: UserLevelCode;
  max_collections: number;
  max_bookmarks_per_collection: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserLevelInfo extends UserLevel {
  current_collections: number;
}

export interface UserLevelLimits {
  canCreateCollection: boolean;
  canCreateBookmark: boolean;
  collectionsLimit: number;
  bookmarksLimit: number;
  collectionsUsed: number;
  bookmarksUsed: number;
}
