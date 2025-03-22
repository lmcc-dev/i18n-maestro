/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 简单缓存类 - 提供基础的内存缓存功能
 * (Simple cache class - provides basic in-memory caching functionality)
 * 
 * 用于存储临时计算结果，提高重复调用的性能
 * (Used to store temporary calculation results, improving performance of repeated calls)
 */
export class SimpleCache<K, V> {
  /**
   * 内部缓存存储 (Internal cache storage)
   */
  private cache: Map<K, { value: V; expiry?: number }> = new Map();

  /**
   * 构造函数 (Constructor)
   * @param defaultMaxAge 缓存项的默认过期时间(毫秒)，0表示永不过期
   *                     (Default expiry time for cache items in milliseconds, 0 means never expire)
   */
  constructor(private defaultMaxAge: number = 0) {}

  /**
   * 设置缓存项 (Set cache item)
   * @param key 缓存键 (Cache key)
   * @param value 缓存值 (Cache value)
   * @param maxAge 可选的过期时间(毫秒)，覆盖默认值 (Optional expiry time in milliseconds, overrides default)
   */
  set(key: K, value: V, maxAge?: number): void {
    const expiryMs = maxAge !== undefined ? maxAge : this.defaultMaxAge;
    const expiry = expiryMs > 0 ? Date.now() + expiryMs : undefined;
    
    this.cache.set(key, { value, expiry });
  }

  /**
   * 获取缓存项 (Get cache item)
   * @param key 缓存键 (Cache key)
   * @returns 缓存值或undefined (Cache value or undefined)
   */
  get(key: K): V | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    // 检查项目是否过期 (Check if item is expired)
    if (item.expiry !== undefined && item.expiry < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  /**
   * 检查缓存项是否存在 (Check if cache item exists)
   * @param key 缓存键 (Cache key)
   * @returns 是否存在且未过期 (Whether it exists and is not expired)
   */
  has(key: K): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // 检查项目是否过期 (Check if item is expired)
    if (item.expiry !== undefined && item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 删除缓存项 (Delete cache item)
   * @param key 缓存键 (Cache key)
   * @returns 是否成功删除 (Whether deletion was successful)
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存 (Clear all cache)
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取所有有效的缓存键 (Get all valid cache keys)
   * @returns 键数组 (Array of keys)
   */
  keys(): K[] {
    // 清理过期项目并返回有效键 (Clean expired items and return valid keys)
    const now = Date.now();
    const validKeys: K[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry === undefined || item.expiry >= now) {
        validKeys.push(key);
      } else {
        this.cache.delete(key);
      }
    }
    
    return validKeys;
  }

  /**
   * 获取缓存大小（有效项目数）(Get cache size (number of valid items))
   * @returns 大小 (Size)
   */
  size(): number {
    return this.keys().length;
  }

  /**
   * 获取或设置缓存项 (Get or set cache item)
   * @param key 缓存键 (Cache key)
   * @param factory 如果缓存未命中，调用此函数创建值 (Function to create value if cache miss)
   * @param maxAge 可选的过期时间 (Optional expiry time)
   * @returns 缓存值 (Cache value)
   */
  getOrSet(key: K, factory: () => V, maxAge?: number): V {
    // 检查缓存 (Check cache)
    const cachedValue = this.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // 创建新值 (Create new value)
    const newValue = factory();
    this.set(key, newValue, maxAge);
    return newValue;
  }
}