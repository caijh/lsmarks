/**
 * 全局状态管理器
 *
 * 这是一个简单但强大的状态管理器，用于管理应用程序的全局状态。
 * 它提供了以下功能：
 * 1. 状态存储和访问
 * 2. 本地存储持久化
 * 3. 状态变更通知
 * 4. 缓存控制
 * 5. 数据压缩
 * 6. 版本控制
 */

import { compress, decompress, isCompressed } from './compression';

// 存储项接口
interface StoreItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version?: number;
}

// 监听器类型
type Listener = () => void;

// 存储键枚举
export enum StoreKey {
  SESSION = 'session',
  USER = 'user',
  COLLECTIONS = 'collections',
  COLLECTION_ITEMS = 'collection_items',
  SETTINGS = 'settings',
}

// 本地存储前缀
const STORAGE_PREFIX = 'bookmark_app_';

// 当前数据版本
const CURRENT_DATA_VERSION = 1;

class Store {
  // 内存存储
  private store: Map<string, StoreItem<any>> = new Map();
  // 监听器
  private listeners: Map<string, Set<Listener>> = new Map();
  // 默认过期时间（毫秒）
  private defaultExpiry = 5 * 60 * 1000; // 5分钟

  // 清理计时器
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // 初始化时从本地存储加载
    this.loadFromLocalStorage();

    // 在窗口关闭前保存到本地存储
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveToLocalStorage();
      });

      // 设置定期清理
      this.cleanupTimer = setInterval(() => {
        this.cleanExpiredData();
      }, 5 * 60 * 1000); // 每5分钟清理一次
    }
  }

  /**
   * 销毁存储实例
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.saveToLocalStorage();
    this.store.clear();
    this.listeners.clear();
  }

  /**
   * 从本地存储加载数据
   */
  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // 获取所有以前缀开头的本地存储项
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(STORAGE_PREFIX)
      );

      for (const key of keys) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            // 检查是否为压缩数据
            let parsedValue;
            if (isCompressed(value)) {
              parsedValue = decompress(value);
            } else {
              parsedValue = JSON.parse(value);
            }

            const storeItem = parsedValue as StoreItem<any>;

            // 检查版本和过期时间
            const isCurrentVersion = storeItem.version === undefined || storeItem.version === CURRENT_DATA_VERSION;
            const isNotExpired = storeItem.expiresAt > Date.now();

            if (isCurrentVersion && isNotExpired) {
              // 从本地存储键中提取存储键
              const storeKey = key.substring(STORAGE_PREFIX.length);

              // 确保有版本号
              if (storeItem.version === undefined) {
                storeItem.version = CURRENT_DATA_VERSION;
              }

              this.store.set(storeKey, storeItem);
            } else {
              // 如果版本不匹配或已过期，删除本地存储项
              localStorage.removeItem(key);

              if (!isCurrentVersion) {
                console.log(`Removed outdated data (version ${storeItem.version}) for key: ${key}`);
              }
            }
          }
        } catch (error) {
          console.error(`Error parsing store item from localStorage: ${key}`, error);
          // 如果解析失败，删除本地存储项
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage', error);
    }
  }

  /**
   * 检查本地存储空间
   * @returns 是否有足够的存储空间
   */
  private checkStorageSpace(): boolean {
    try {
      // 尝试存储1MB的数据
      const testKey = STORAGE_PREFIX + 'test_storage_space';
      const testData = new Array(1024 * 1024).join('a');

      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);

      return true;
    } catch (error) {
      console.warn('Local storage is full or disabled', error);
      return false;
    }
  }

  /**
   * 清理过期数据
   */
  private cleanExpiredData(): void {
    const now = Date.now();

    // 清理内存存储中的过期数据
    for (const [key, item] of this.store.entries()) {
      if (item.expiresAt < now) {
        this.store.delete(key);
      }
    }

    // 清理本地存储中的过期数据
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(key =>
          key.startsWith(STORAGE_PREFIX)
        );

        for (const key of keys) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const item = JSON.parse(value) as StoreItem<any>;
              if (item.expiresAt < now) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // 如果解析失败，删除本地存储项
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error('Error cleaning expired data from localStorage', error);
      }
    }
  }

  /**
   * 保存数据到本地存储
   */
  private saveToLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // 先清理过期数据
      this.cleanExpiredData();

      // 检查存储空间
      if (!this.checkStorageSpace()) {
        console.warn('Not enough storage space, skipping save to localStorage');
        return;
      }

      // 遍历存储，保存所有项
      for (const [key, item] of this.store.entries()) {
        if (item.expiresAt > Date.now()) {
          const storageKey = STORAGE_PREFIX + key;
          try {
            // 压缩数据以节省空间
            const compressedData = compress(item);
            localStorage.setItem(storageKey, compressedData);
          } catch (error) {
            console.error(`Error saving item to localStorage: ${key}`, error);
            // 如果存储失败，尝试清理更多空间
            this.cleanExpiredData();
          }
        }
      }
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  /**
   * 获取数据
   * @param key 存储键
   * @returns 数据，如果不存在或已过期则返回null
   */
  get<T>(key: string): T | null {
    const item = this.store.get(key);

    if (!item) return null;

    // 检查是否过期
    if (item.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 设置数据
   * @param key 存储键
   * @param data 数据
   * @param expiry 过期时间（毫秒），默认为5分钟
   */
  set<T>(key: string, data: T, expiry: number = this.defaultExpiry): void {
    const now = Date.now();

    this.store.set(key, {
      data,
      timestamp: now,
      expiresAt: now + expiry,
      version: CURRENT_DATA_VERSION
    });

    // 通知监听器
    this.notify(key);

    // 如果在浏览器环境中，立即保存到本地存储
    if (typeof window !== 'undefined') {
      try {
        const storageKey = STORAGE_PREFIX + key;
        localStorage.setItem(storageKey, JSON.stringify(this.store.get(key)));
      } catch (error) {
        console.error(`Error saving to localStorage: ${key}`, error);
      }
    }
  }

  /**
   * 删除数据
   * @param key 存储键
   */
  remove(key: string): void {
    this.store.delete(key);

    // 通知监听器
    this.notify(key);

    // 如果在浏览器环境中，从本地存储中删除
    if (typeof window !== 'undefined') {
      try {
        const storageKey = STORAGE_PREFIX + key;
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error);
      }
    }
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    const keys = [...this.store.keys()];

    this.store.clear();

    // 通知所有监听器
    for (const key of keys) {
      this.notify(key);
    }

    // 如果在浏览器环境中，清除所有本地存储项
    if (typeof window !== 'undefined') {
      try {
        const storageKeys = Object.keys(localStorage).filter(key =>
          key.startsWith(STORAGE_PREFIX)
        );

        for (const key of storageKeys) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Error clearing localStorage', error);
      }
    }
  }

  /**
   * 添加监听器
   * @param key 存储键
   * @param listener 监听器函数
   * @returns 取消监听的函数
   */
  subscribe(key: string, listener: Listener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // 返回取消订阅函数
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * 通知监听器
   * @param key 存储键
   */
  private notify(key: string): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener());
    }
  }

  /**
   * 检查数据是否存在且未过期
   * @param key 存储键
   * @returns 是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.store.get(key);

    if (!item) return false;

    // 检查是否过期
    if (item.expiresAt < Date.now()) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取数据的过期时间
   * @param key 存储键
   * @returns 过期时间（毫秒时间戳），如果不存在则返回0
   */
  getExpiry(key: string): number {
    const item = this.store.get(key);

    if (!item) return 0;

    return item.expiresAt;
  }

  /**
   * 更新数据的过期时间
   * @param key 存储键
   * @param expiry 新的过期时间（毫秒），默认为5分钟
   * @returns 是否成功更新
   */
  updateExpiry(key: string, expiry: number = this.defaultExpiry): boolean {
    const item = this.store.get(key);

    if (!item) return false;

    item.expiresAt = Date.now() + expiry;

    // 通知监听器
    this.notify(key);

    return true;
  }
}

// 创建单例实例
const store = new Store();

export default store;
