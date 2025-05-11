/**
 * 统一的API客户端
 *
 * 这是一个统一的API客户端，用于处理所有API请求。
 * 它提供了以下功能：
 * 1. 请求缓存和去重
 * 2. 错误处理
 * 3. 请求拦截
 * 4. 响应拦截
 */

import store, { StoreKey } from './store';

// 请求配置接口
interface RequestConfig extends RequestInit {
  // 是否使用缓存
  useCache?: boolean;
  // 缓存时间（毫秒）
  cacheTime?: number;
  // 缓存键前缀
  cacheKeyPrefix?: string;
}

// 响应接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 正在进行中的请求映射
const pendingRequests: Map<string, Promise<any>> = new Map();

// 默认缓存时间（毫秒）
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5分钟

/**
 * 生成缓存键
 * @param url 请求URL
 * @param method 请求方法
 * @param body 请求体
 * @param prefix 缓存键前缀
 * @returns 缓存键
 */
function generateCacheKey(url: string, method: string, body?: any, prefix: string = ''): string {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${prefix}${method}:${url}:${bodyStr}`;
}

/**
 * 发送请求
 * @param url 请求URL
 * @param config 请求配置
 * @returns 响应
 */
async function request<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    useCache = true,
    cacheTime = DEFAULT_CACHE_TIME,
    cacheKeyPrefix = '',
    ...restConfig
  } = config;

  // 生成缓存键
  const cacheKey = generateCacheKey(url, method, body, cacheKeyPrefix);

  // 如果使用缓存，检查是否有缓存
  if (useCache) {
    const cachedData = store.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // 检查是否有相同的请求正在进行中
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // 检查网络状态，如果离线且有缓存数据，直接返回缓存数据
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const offlineData = store.get<T>(cacheKey);
    if (offlineData) {
      console.log(`Using cached data for offline request: ${url}`);
      return offlineData;
    }
    throw new Error('Network is offline and no cached data available');
  }

  // 创建请求Promise
  const requestPromise = (async () => {
    try {
      // 添加请求头
      const headers = new Headers(restConfig.headers || {});
      headers.set('Content-Type', 'application/json');

      // 执行请求
      const response = await fetch(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        ...restConfig,
        headers
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API request failed: ${url}`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Request failed with status: ${response.status} - ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error(`Failed to parse response as JSON: ${url}`, error);
        throw new Error('Invalid response format');
      }

      // 如果使用缓存，缓存响应
      if (useCache) {
        store.set(cacheKey, data, cacheTime);
      }

      return data;
    } catch (error) {
      console.error(`Request failed: ${url}`, error);
      throw error;
    } finally {
      // 请求完成后，从pendingRequests中删除
      pendingRequests.delete(cacheKey);
    }
  })();

  // 将请求添加到pendingRequests中
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * 发送标准API请求
 * @param url 请求URL
 * @param config 请求配置
 * @returns 响应数据
 */
async function standardRequest<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
  const response = await request<ApiResponse<T>>(url, config);

  if (response.code !== 0) {
    throw new Error(response.message || 'Request failed');
  }

  return response.data;
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
async function getUserInfo() {
  // 首先检查存储中是否有用户信息
  const cachedUser = store.get(StoreKey.USER);
  if (cachedUser) {
    return cachedUser;
  }

  try {
    const response = await fetch('/api/user/profile');
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();

    // 存储用户信息
    store.set(StoreKey.USER, data, 30 * 60 * 1000); // 30分钟

    return data;
  } catch (error) {
    console.error('Failed to get user info', error);
    return null;
  }
}

/**
 * 获取会话信息
 * @returns 会话信息
 */
async function getSession() {
  // 首先检查存储中是否有会话信息
  const cachedSession = store.get(StoreKey.SESSION);
  if (cachedSession) {
    return cachedSession;
  }

  try {
    const data = await request('/api/auth/session', {
      cacheKeyPrefix: 'session:',
      cacheTime: 30 * 60 * 1000 // 30分钟
    });

    // 存储会话信息
    store.set(StoreKey.SESSION, data, 30 * 60 * 1000); // 30分钟

    return data;
  } catch (error) {
    console.error('Failed to get session', error);
    return null;
  }
}

/**
 * 获取书签集合
 * @param page 页码
 * @param limit 每页数量
 * @param userUuid 用户UUID
 * @returns 书签集合
 */
async function getBookmarkCollections(page = 1, limit = 20, userUuid?: string) {
  // 构建查询参数
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (userUuid) {
    params.append('user_uuid', userUuid);
  }

  // 注意：公开集合功能已移除

  // 生成缓存键
  const cacheKey = `collections:${page}:${limit}:${userUuid || ''}`;

  // 首先检查存储中是否有集合信息
  const cachedCollections = store.get(cacheKey);
  if (cachedCollections) {
    return cachedCollections;
  }

  try {
    const data = await standardRequest(`/api/bookmark/collections?${params.toString()}`, {
      cacheKeyPrefix: 'collections:',
      cacheTime: 5 * 60 * 1000 // 5分钟
    });

    // 存储集合信息
    store.set(cacheKey, data, 5 * 60 * 1000); // 5分钟

    return data;
  } catch (error) {
    console.error('Failed to get bookmark collections', error);
    return null;
  }
}

/**
 * 获取书签集合详情
 * @param uuid 集合UUID
 * @returns 集合详情
 */
async function getBookmarkCollection(uuid: string) {
  // 生成缓存键
  const cacheKey = `collection:${uuid}`;

  // 首先检查存储中是否有集合详情
  const cachedCollection = store.get(cacheKey);
  if (cachedCollection) {
    return cachedCollection;
  }

  try {
    const data = await standardRequest(`/api/bookmark/collections/${uuid}`, {
      cacheKeyPrefix: 'collection:',
      cacheTime: 5 * 60 * 1000 // 5分钟
    });

    // 存储集合详情
    store.set(cacheKey, data, 5 * 60 * 1000); // 5分钟

    return data;
  } catch (error) {
    console.error(`Failed to get bookmark collection: ${uuid}`, error);
    return null;
  }
}

/**
 * 获取书签项目
 * @param collectionUuid 集合UUID
 * @returns 书签项目
 */
async function getBookmarkItems(collectionUuid: string) {
  // 生成缓存键
  const cacheKey = `items:${collectionUuid}`;

  // 首先检查存储中是否有项目信息
  const cachedItems = store.get(cacheKey);
  if (cachedItems) {
    return cachedItems;
  }

  try {
    const data = await standardRequest(`/api/bookmark/items?collection_uuid=${collectionUuid}`, {
      cacheKeyPrefix: 'items:',
      cacheTime: 5 * 60 * 1000 // 5分钟
    });

    // 存储项目信息
    store.set(cacheKey, data, 5 * 60 * 1000); // 5分钟

    return data;
  } catch (error) {
    console.error(`Failed to get bookmark items: ${collectionUuid}`, error);
    return null;
  }
}

/**
 * 清除缓存
 * @param key 缓存键，如果不提供则清除所有缓存
 */
function clearCache(key?: string) {
  if (key) {
    store.remove(key);
  } else {
    store.clear();
  }
}

// 导出API客户端
const apiClient = {
  request,
  standardRequest,
  getUserInfo,
  getSession,
  getBookmarkCollections,
  getBookmarkCollection,
  getBookmarkItems,
  clearCache
};

export default apiClient;
