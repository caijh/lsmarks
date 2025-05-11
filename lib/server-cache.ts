/**
 * 服务器端缓存
 *
 * 用于缓存服务器端数据，减少数据库查询次数
 */

import { LRUCache } from 'lru-cache';

// 缓存选项
const options = {
  // 最大缓存项数
  max: 500,

  // 缓存项最大年龄（毫秒）
  ttl: 1000 * 60 * 5, // 5分钟

  // 更新缓存项时是否更新其年龄
  updateAgeOnGet: true,

  // 缓存项大小计算函数
  sizeCalculation: (value: any) => {
    // 简单估计缓存项大小（字节）
    return JSON.stringify(value).length;
  },

  // 缓存最大大小（字节）
  maxSize: 5 * 1024 * 1024, // 5MB
};

// 创建缓存实例
const cache = new LRUCache(options);

/**
 * 获取缓存项
 * @param key 缓存键
 * @returns 缓存项，如果不存在则返回undefined
 */
export function get<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

/**
 * 设置缓存项
 * @param key 缓存键
 * @param value 缓存值
 * @param ttl 缓存时间（毫秒），如果不提供则使用默认值
 */
export function set<T>(key: string, value: T, ttl?: number): void {
  cache.set(key, value, { ttl });
}

/**
 * 删除缓存项
 * @param key 缓存键
 * @returns 是否成功删除
 */
export function del(key: string): boolean {
  return cache.delete(key);
}

/**
 * 清空缓存
 */
export function clear(): void {
  cache.clear();
}

/**
 * 使用缓存执行函数
 * @param key 缓存键
 * @param fn 要执行的函数
 * @param ttl 缓存时间（毫秒），如果不提供则使用默认值
 * @returns 函数执行结果
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // 检查缓存
  const cached = get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  // 执行函数
  const result = await fn();

  // 缓存结果
  set(key, result, ttl);

  return result;
}

/**
 * 使缓存项无效（删除缓存项）
 * @param key 缓存键
 * @returns 是否成功删除
 */
export function invalidate(key: string): boolean {
  console.log(`Invalidating cache for key: ${key}`);
  return del(key);
}
