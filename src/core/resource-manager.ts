/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { I18nConfig } from '../types';
import { TranslationUtils } from '../utils/translation-utils';

/**
 * 资源管理器类，负责管理翻译资源 (Resource manager class, responsible for managing translation resources)
 */
export class ResourceManager {
  // 资源存储: { 语言 -> { 命名空间 -> { 键 -> 值 } } }
  // (Resource storage: { language -> { namespace -> { key -> value } } })
  private store: Record<string, Record<string, Record<string, any>>> = {};

  /**
   * 构造函数 (Constructor)
   * @param config I18n配置 (I18n configuration)
   */
  constructor(private config: I18nConfig) {
    // 初始化资源存储 (Initialize resource storage)
    this.initializeStore();
  }

  /**
   * 初始化资源存储 (Initialize resource storage)
   */
  private initializeStore(): void {
    // 为每种配置的语言创建空存储 (Create empty storage for each configured language)
    for (const lang of this.config.languages) {
      this.store[lang] = {};
      
      // 如果配置了命名空间，为每个命名空间创建空对象
      // (If namespaces are configured, create empty objects for each namespace)
      if (this.config.resourceOptions?.namespaces) {
        for (const ns of this.config.resourceOptions.namespaces) {
          this.store[lang][ns] = {};
        }
      } else {
        // 否则使用默认命名空间 (Otherwise use default namespace)
        const defaultNs = this.config.resourceOptions?.defaultNamespace || 'translation';
        this.store[lang][defaultNs] = {};
      }
    }
    
    // 如果配置了资源路径，加载资源 (If resource path is configured, load resources)
    // 此处保留加载逻辑，实际实现略复杂，需要依赖文件系统
    // (Loading logic is reserved here, actual implementation is more complex and depends on file system)
    if (typeof this.config.resources === 'string') {
      // TODO: 实现从文件系统加载资源的逻辑
      // (TODO: Implement logic to load resources from file system)
      console.log(`将从路径 ${this.config.resources} 加载资源`);
    }
  }

  /**
   * 从对象中添加资源 (Add resources from object)
   * @param resources 资源对象 (Resource object)
   */
  addResourcesFromObject(resources: Record<string, Record<string, any>>): void {
    // 遍历资源对象 (Iterate through resource object)
    for (const lang in resources) {
      if (Object.prototype.hasOwnProperty.call(resources, lang)) {
        // 如果语言不在配置的语言列表中，跳过 (Skip if language is not in configured languages list)
        if (!this.config.languages.includes(lang)) {
          console.warn(`语言 ${lang} 不在配置的语言列表中，跳过资源加载`);
          continue;
        }
        
        // 为该语言创建存储（如果不存在） (Create storage for the language if it doesn't exist)
        if (!this.store[lang]) {
          this.store[lang] = {};
        }
        
        // 遍历该语言的命名空间 (Iterate through namespaces for the language)
        for (const ns in resources[lang]) {
          if (Object.prototype.hasOwnProperty.call(resources[lang], ns)) {
            // 为该命名空间创建存储（如果不存在） (Create storage for the namespace if it doesn't exist)
            if (!this.store[lang][ns]) {
              this.store[lang][ns] = {};
            }
            
            // 添加资源 (Add resources)
            this.store[lang][ns] = {
              ...this.store[lang][ns],
              ...resources[lang][ns],
            };
          }
        }
      }
    }
  }

  /**
   * 添加资源 (Add resources)
   * @param lang 语言代码 (Language code)
   * @param namespace 命名空间 (Namespace)
   * @param resources 资源对象 (Resource object)
   */
  addResources(lang: string, namespace: string, resources: Record<string, any>): void {
    // 如果语言不在存储中，创建它 (If language is not in storage, create it)
    if (!this.store[lang]) {
      this.store[lang] = {};
    }
    
    // 如果命名空间不在存储中，创建它 (If namespace is not in storage, create it)
    if (!this.store[lang][namespace]) {
      this.store[lang][namespace] = {};
    }
    
    // 添加资源 (Add resources)
    this.store[lang][namespace] = {
      ...this.store[lang][namespace],
      ...resources,
    };
  }

  /**
   * 获取翻译 (Get translation)
   * @param lang 语言代码 (Language code)
   * @param namespace 命名空间 (Namespace)
   * @param key 翻译键 (Translation key)
   * @returns 翻译值 (Translation value)
   */
  getTranslation(lang: string, namespace: string, key: string): any {
    // 检查语言是否存在 (Check if language exists)
    if (!this.store[lang]) {
      return undefined;
    }
    
    // 检查命名空间是否存在 (Check if namespace exists)
    if (!this.store[lang][namespace]) {
      return undefined;
    }
    
    // 从命名空间获取键值 (Get key value from namespace)
    // 处理嵌套键，例如 'user.profile.name' (Handle nested keys, e.g. 'user.profile.name')
    return TranslationUtils.getValueByPath(this.store[lang][namespace], key);
  }

  /**
   * 检查是否有翻译 (Check if translation exists)
   * @param lang 语言代码 (Language code)
   * @param namespace 命名空间 (Namespace)
   * @param key 翻译键 (Translation key)
   * @returns 是否存在翻译 (Whether translation exists)
   */
  hasTranslation(lang: string, namespace: string, key: string): boolean {
    return this.getTranslation(lang, namespace, key) !== undefined;
  }

  /**
   * 获取存储 (Get store)
   * @returns 资源存储 (Resource store)
   */
  getStore(): Record<string, Record<string, Record<string, any>>> {
    return this.store;
  }

  /**
   * 获取所有键 (Get all keys)
   * @returns 键数组 (Array of keys)
   */
  getAllKeys(): string[] {
    const keys = new Set<string>();
    
    // 遍历所有语言和命名空间，收集所有唯一键
    // (Iterate through all languages and namespaces to collect all unique keys)
    for (const lang in this.store) {
      if (Object.prototype.hasOwnProperty.call(this.store, lang)) {
        for (const ns in this.store[lang]) {
          if (Object.prototype.hasOwnProperty.call(this.store[lang], ns)) {
            // 获取该命名空间中的所有键，并添加到结果集
            // (Get all keys in the namespace and add them to the result set)
            const nsKeys = this.getKeysRecursive(this.store[lang][ns]);
            nsKeys.forEach(key => keys.add(`${ns}:${key}`));
          }
        }
      }
    }
    
    return Array.from(keys);
  }

  /**
   * 递归获取对象中的所有键，扁平化处理嵌套结构
   * (Recursively get all keys in an object, flattening nested structures)
   * @param obj 对象 (Object)
   * @param prefix 前缀 (Prefix)
   * @returns 键数组 (Array of keys)
   */
  private getKeysRecursive(obj: Record<string, any>, prefix: string = ''): string[] {
    let keys: string[] = [];
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          // 如果值是对象，递归获取其所有键 (If value is an object, recursively get all its keys)
          keys = keys.concat(this.getKeysRecursive(obj[key], fullKey));
        } else {
          // 值不是对象，添加当前键 (Value is not an object, add current key)
          keys.push(fullKey);
        }
      }
    }
    
    return keys;
  }

  /**
   * 获取特定语言的所有键 (Get all keys for a specific language)
   * @param lang 语言代码 (Language code)
   * @returns 键数组 (Array of keys)
   */
  getKeysForLanguage(lang: string): string[] {
    const keys = new Set<string>();
    
    // 语言不存在则返回空数组 (Return empty array if language doesn't exist)
    if (!this.store[lang]) {
      return [];
    }
    
    // 遍历该语言的所有命名空间 (Iterate through all namespaces for the language)
    for (const ns in this.store[lang]) {
      if (Object.prototype.hasOwnProperty.call(this.store[lang], ns)) {
        // 获取命名空间中的所有键 (Get all keys in the namespace)
        const nsKeys = this.getKeysRecursive(this.store[lang][ns]);
        nsKeys.forEach(key => keys.add(`${ns}:${key}`));
      }
    }
    
    return Array.from(keys);
  }

  /**
   * 获取特定命名空间的所有键 (Get all keys for a specific namespace)
   * @param lang 语言代码 (Language code)
   * @param namespace 命名空间 (Namespace)
   * @returns 键数组 (Array of keys)
   */
  getKeysForNamespace(lang: string, namespace: string): string[] {
    // 语言或命名空间不存在则返回空数组
    // (Return empty array if language or namespace doesn't exist)
    if (!this.store[lang] || !this.store[lang][namespace]) {
      return [];
    }
    
    // 获取命名空间中的所有键 (Get all keys in the namespace)
    const keys = this.getKeysRecursive(this.store[lang][namespace]);
    return keys.map(key => `${namespace}:${key}`);
  }

  /**
   * 获取所有命名空间 (Get all namespaces)
   * @returns 命名空间数组 (Array of namespaces)
   */
  getAllNamespaces(): string[] {
    const namespaces = new Set<string>();
    
    // 遍历所有语言，收集所有唯一命名空间
    // (Iterate through all languages to collect all unique namespaces)
    for (const lang in this.store) {
      if (Object.prototype.hasOwnProperty.call(this.store, lang)) {
        for (const ns in this.store[lang]) {
          if (Object.prototype.hasOwnProperty.call(this.store[lang], ns)) {
            namespaces.add(ns);
          }
        }
      }
    }
    
    return Array.from(namespaces);
  }
}