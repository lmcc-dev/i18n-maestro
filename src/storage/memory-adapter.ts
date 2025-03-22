/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { BaseStorageAdapter, BaseStorageAdapterOptions } from './storage-adapter';

/**
 * 内存存储适配器选项 (Memory storage adapter options)
 */
export interface MemoryAdapterOptions extends BaseStorageAdapterOptions {
  /**
   * 初始资源数据 (Initial resource data)
   * { 语言 -> { 命名空间 -> 资源对象 } }
   * ({ language -> { namespace -> resource object } })
   */
  initialResources?: Record<string, Record<string, Record<string, any>>>;
}

/**
 * 内存存储适配器 - 在内存中存储资源，适用于测试和单页应用
 * (Memory storage adapter - stores resources in memory, suitable for testing and single-page applications)
 * 
 * 该适配器将所有资源存储在内存中，不进行持久化
 * (This adapter stores all resources in memory without persistence)
 */
export class MemoryAdapter extends BaseStorageAdapter {
  /**
   * 资源存储 (Resource storage)
   * { 语言 -> { 命名空间 -> 资源对象 } }
   * ({ language -> { namespace -> resource object } })
   */
  protected resources: Record<string, Record<string, Record<string, any>>> = {};
  
  /**
   * 构造函数 (Constructor)
   * @param options 内存适配器选项 (Memory adapter options)
   */
  constructor(options: MemoryAdapterOptions = {}) {
    super(options);
    
    // 初始化资源 (Initialize resources)
    if (options.initialResources) {
      this.resources = JSON.parse(JSON.stringify(options.initialResources));
    } else {
      this.resources = {};
    }
  }
  
  /**
   * 获取所有支持的语言 (Get all supported languages)
   * @returns 语言列表 (Language list)
   */
  public getLanguages(): string[] {
    return Object.keys(this.resources);
  }
  
  /**
   * 获取所有命名空间 (Get all namespaces)
   * @returns 命名空间列表 (Namespace list)
   */
  public getNamespaces(): string[] {
    // 从所有语言中收集命名空间 (Collect namespaces from all languages)
    const namespaceSet = new Set<string>();
    
    Object.values(this.resources).forEach(langResources => {
      Object.keys(langResources).forEach(ns => namespaceSet.add(ns));
    });
    
    return Array.from(namespaceSet);
  }
  
  /**
   * 获取资源 (Get resource)
   * 覆盖基类方法返回同步结果 (Override base class method to return synchronous result)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象 (Resource object)
   */
  public getResource(
    lang: string,
    namespace: string,
  ): Record<string, any> {
    const cacheKey = this.getCacheKey(lang, namespace);
    
    // 如果启用了缓存且缓存中有数据，则返回缓存数据
    // (If cache is enabled and data exists in cache, return cached data)
    if (this.cacheEnabled && this.cache[cacheKey]) {
      return JSON.parse(JSON.stringify(this.cache[cacheKey]));
    }
    
    try {
      // 获取资源 (Get resource)
      const resources = this.loadResourceSync(lang, namespace);
      
      // 如果启用了缓存，则缓存数据 (If cache is enabled, cache data)
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
   * 覆盖基类方法返回同步结果 (Override base class method to return synchronous result)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @param data 资源数据 (Resource data)
   */
  public saveResource(
    lang: string,
    namespace: string,
    data: Record<string, any>,
  ): void {
    try {
      // 保存资源 (Save resource)
      this.persistResourceSync(lang, namespace, data);
      
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
   * 同步加载资源 (Synchronous load resource)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象 (Resource object)
   */
  protected loadResourceSync(
    lang: string,
    namespace: string,
  ): Record<string, any> {
    // 如果语言或命名空间不存在，返回空对象
    // (If language or namespace doesn't exist, return empty object)
    if (
      !this.resources[lang] ||
      !this.resources[lang][namespace]
    ) {
      return {};
    }
    
    // 返回资源的深拷贝，防止外部修改
    // (Return deep copy of resources to prevent external modification)
    return JSON.parse(JSON.stringify(this.resources[lang][namespace]));
  }
  
  /**
   * 同步保存资源 (Synchronous save resource)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @param data 资源数据 (Resource data)
   */
  protected persistResourceSync(
    lang: string,
    namespace: string,
    data: Record<string, any>,
  ): void {
    // 确保语言对象存在 (Ensure language object exists)
    if (!this.resources[lang]) {
      this.resources[lang] = {};
    }
    
    // 保存资源数据的深拷贝 (Save deep copy of resource data)
    this.resources[lang][namespace] = JSON.parse(JSON.stringify(data));
  }

  /**
   * 异步加载资源 - 实现抽象方法 (Asynchronous load resource - implement abstract method)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象的Promise (Promise of resource object)
   */
  protected async loadResource(
    lang: string,
    namespace: string
  ): Promise<Record<string, any>> {
    return this.loadResourceSync(lang, namespace);
  }
  
  /**
   * 异步保存资源 - 实现抽象方法 (Asynchronous save resource - implement abstract method)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @param data 资源数据 (Resource data)
   * @returns void的Promise (Promise of void)
   */
  protected async persistResource(
    lang: string,
    namespace: string,
    data: Record<string, any>
  ): Promise<void> {
    this.persistResourceSync(lang, namespace, data);
  }
  
  /**
   * 清除所有资源 (Clear all resources)
   */
  public clearResources(): void {
    this.resources = {};
    this.clearCache();
  }
  
  /**
   * 设置初始资源 (Set initial resources)
   * @param resources 资源数据 (Resource data)
   */
  public setInitialResources(
    resources: Record<string, Record<string, Record<string, any>>>,
  ): void {
    this.resources = JSON.parse(JSON.stringify(resources));
    this.clearCache();
  }
  
  /**
   * 导出所有资源 (Export all resources)
   * @returns 资源数据 (Resource data)
   */
  public exportResources(): Record<string, Record<string, Record<string, any>>> {
    return JSON.parse(JSON.stringify(this.resources));
  }
}