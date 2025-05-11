import { UserLevelInfo, UserLevelLimits } from "@/types/user-level";
import {
  getUserLevelInfo,
  canUserCreateCollection,
  canUserCreateBookmark,
  getUserBookmarkUsage
} from "@/models/user-level";
import * as serverCache from "@/lib/server-cache";

// 获取用户等级信息（带缓存）
export async function getUserLevel(userUuid: string): Promise<UserLevelInfo | null> {
  if (!userUuid) return null;

  const cacheKey = `user_level:${userUuid}`;

  return await serverCache.cached(
    cacheKey,
    async () => await getUserLevelInfo(userUuid),
    5 * 60 * 1000 // 缓存5分钟
  );
}

// 获取用户限制信息
export async function getUserLevelLimits(userUuid: string, subcategoryUuid?: string): Promise<UserLevelLimits> {
  try {
    if (!userUuid) {
      return getDefaultLimits();
    }

    // 获取用户等级信息
    const levelInfo = await getUserLevel(userUuid);
    if (!levelInfo) {
      return getDefaultLimits();
    }

    // 获取用户书签使用情况
    const usage = await getUserBookmarkUsage(userUuid);
    if (!usage) {
      return getDefaultLimits();
    }

    // 检查是否可以创建新集合
    const canCreateCollection = await canUserCreateCollection(userUuid);

    // 检查是否可以创建新书签（如果提供了子分类UUID）
    let canCreateBookmark = true;
    if (subcategoryUuid) {
      canCreateBookmark = await canUserCreateBookmark(subcategoryUuid, userUuid);
    }

    return {
      canCreateCollection,
      canCreateBookmark,
      collectionsLimit: levelInfo.max_collections,
      bookmarksLimit: levelInfo.max_bookmarks_per_collection,
      collectionsUsed: usage.collectionsUsed,
      bookmarksUsed: Object.values(usage.bookmarksUsed).reduce((sum, count) => sum + count, 0)
    };
  } catch (error) {
    console.error(`Error getting user level limits for user ${userUuid}:`, error);
    return getDefaultLimits();
  }
}

// 获取默认限制（免费用户）
function getDefaultLimits(): UserLevelLimits {
  return {
    canCreateCollection: true,
    canCreateBookmark: true,
    collectionsLimit: 3,
    bookmarksLimit: 50,
    collectionsUsed: 0,
    bookmarksUsed: 0
  };
}

// 清除用户等级缓存
export function clearUserLevelCache(userUuid: string): void {
  if (!userUuid) return;

  const cacheKey = `user_level:${userUuid}`;
  serverCache.del(cacheKey);
}
