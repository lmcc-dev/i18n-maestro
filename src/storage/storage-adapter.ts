/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { StorageAdapter } from '../types';

/**
 * 存储适配器基类 - 提供基础接口实现和共用方法
 * (Storage adapter base class - provides basic interface implementation and shared methods)
 * 
 * 该类为不同的存储后端提供了统一的接口和基础功能
 * (This class provides a unified interface and basic functionality for different storage backends)
 */
export abstract class BaseStorageAdapter implements StorageAdapter {
  /**
   * 资源缓存 (Resource cache)
   * { 语言.命名空间 -> 资源对象 }
   * ({ language.namespace -> resource object })
   */
  protected cache: Record<string, Record<string, any>> = {};
  
  /**
   * 是否启用缓存 (Whether cache is enabled)
   */
  protected cacheEnabled: boolean;
  
  /**
   * 构造函数 (Constructor)
   * @param options 可选的存储适配器选项 (Optional storage adapter options)
   */
  constructor(protected options: BaseStorageAdapterOptions = {}) {
    this.options = {
      cacheEnabled: true,
      ...options,
    };
    this.cacheEnabled = this.options.cacheEnabled ?? true;
  }
  
  /**
   * 获取资源 (Get resource)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象的Promise (Promise of resource object)
   */
  public async getResource(
    lang: string,
    namespace: string,
  ): Promise<Record<string, any>> {
    const cacheKey = this.getCacheKey(lang, namespace);
    
    // 如果启用了缓存且缓存中有数据，则返回缓存数据
    // (If cache is enabled and data exists in cache, return cached data)
    if (this.cacheEnabled && this.cache[cacheKey]) {
      return JSON.parse(JSON.stringify(this.cache[cacheKey]));
    }
    
    try {
      // 调用子类实现的加载方法 (Call load method implemented by subclass)
      const resources = await this.loadResource(lang, namespace);
      
      // 如果启用了缓存，则缓存加载的数据
      // (If cache is enabled, cache loaded data)
      if (this.cacheEnabled) {
        this.cache[cacheKey] = JSON.parse(JSON.stringify(resources));
      }
      
      return JSON.parse(JSON.stringify(resources));
    } catch (error) {
      console.error(`Error loading resource [${lang}:${namespace}]:`, error);
      return {};
    }
  }
  
  /**
   * 保存资源 (Save resource)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @param data 资源数据 (Resource data)
   * @returns void的Promise (Promise of void)
   */
  public async saveResource(
    lang: string,
    namespace: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      // 调用子类实现的保存方法 (Call save method implemented by subclass)
      await this.persistResource(lang, namespace, data);
      
      // 更新缓存 (Update cache)
      if (this.cacheEnabled) {
        const cacheKey = this.getCacheKey(lang, namespace);
        this.cache[cacheKey] = JSON.parse(JSON.stringify(data));
      }
    } catch (error) {
      console.error(`Error saving resource [${lang}:${namespace}]:`, error);
      throw error; // 重新抛出错误以让调用者知道 (Re-throw error to let callers know)
    }
  }
  
  /**
   * 获取所有支持的语言 (Get all supported languages)
   * @returns 语言列表的Promise (Promise of language list)
   */
  public abstract getLanguages(): Promise<string[]> | string[];
  
  /**
   * 获取所有命名空间 (Get all namespaces)
   * @returns 命名空间列表的Promise (Promise of namespace list)
   */
  public abstract getNamespaces(): Promise<string[]> | string[];
  
  /**
   * 清除缓存 (Clear cache)
   * @param lang 可选的语言，如果提供则只清除该语言的缓存 (Optional language, if provided only clears cache for that language)
   * @param namespace 可选的命名空间，如果提供则只清除该命名空间的缓存 (Optional namespace, if provided only clears cache for that namespace)
   */
  public clearCache(lang?: string, namespace?: string): void {
    if (lang && namespace) {
      // 清除特定语言和命名空间的缓存 (Clear cache for specific language and namespace)
      const cacheKey = this.getCacheKey(lang, namespace);
      delete this.cache[cacheKey];
    } else if (lang) {
      // 清除特定语言的所有命名空间缓存 (Clear cache for all namespaces of a specific language)
      const prefix = `${lang}.`;
      Object.keys(this.cache).forEach(key => {
        if (key.startsWith(prefix)) {
          delete this.cache[key];
        }
      });
    } else {
      // 清除所有缓存 (Clear all cache)
      this.cache = {};
    }
  }
  
  /**
   * 获取缓存键 (Get cache key)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 缓存键 (Cache key)
   */
  protected getCacheKey(lang: string, namespace: string): string {
    return `${lang}.${namespace}`;
  }
  
  /**
   * 加载资源的具体实现 (Specific implementation of loading resource)
   * 需要被子类实现 (Needs to be implemented by subclass)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象的Promise (Promise of resource object)
   */
  protected abstract loadResource(
    lang: string,
    namespace: string
  ): Promise<Record<string, any>>;
  
  /**
   * 保存资源的具体实现 (Specific implementation of saving resource)
   * 需要被子类实现 (Needs to be implemented by subclass)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @param data 资源数据 (Resource data)
   * @returns void的Promise (Promise of void)
   */
  protected abstract persistResource(
    lang: string,
    namespace: string,
    data: Record<string, any>
  ): Promise<void>;
}

/**
 * 存储适配器基本选项 (Storage adapter basic options)
 */
export interface BaseStorageAdapterOptions {
  /**
   * 是否启用缓存 (Whether to enable cache)
   * @default true
   */
  cacheEnabled?: boolean;
  
  /**
   * 其他扩展选项 (Other extension options)
   */
  [key: string]: any;
}