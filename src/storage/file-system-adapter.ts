/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import path from 'path';
import * as fs from 'fs/promises';
import { sync as globSync } from 'glob';
import { StorageAdapter } from '../types';

/**
 * 文件系统存储适配器选项 (File system storage adapter options)
 */
export interface FileSystemAdapterOptions {
  /**
   * 资源文件的根目录 (Root directory for resource files)
   */
  resourcesPath: string;
  
  /**
   * 文件扩展名 (File extension)
   * @default ".json"
   */
  fileExtension?: string;
  
  /**
   * 是否创建不存在的目录 (Whether to create directories that don't exist)
   * @default true
   */
  createDirectories?: boolean;
  
  /**
   * 文件编码 (File encoding)
   * @default "utf8"
   */
  encoding?: string;
  
  /**
   * 是否启用缓存 (Whether to enable cache)
   * @default true
   */
  cacheEnabled?: boolean;
}

/**
 * 文件系统存储适配器 - 从本地文件系统加载和保存资源
 * (File system storage adapter - loads and saves resources from local file system)
 * 
 * 该适配器允许从本地文件系统读取和写入翻译资源文件
 * (This adapter allows reading and writing translation resource files from the local file system)
 */
export class FileSystemAdapter implements StorageAdapter {
  // 私有属性 (Private properties)
  private cache: Map<string, Record<string, any>> = new Map();
  private options: FileSystemAdapterOptions;
  
  /**
   * 构造函数 (Constructor)
   * @param options 文件系统适配器选项 (File system adapter options)
   */
  constructor(options: FileSystemAdapterOptions) {
    if (!options.resourcesPath) {
      throw new Error('resourcesPath is required');
    }

    this.options = {
      fileExtension: '.json',
      createDirectories: true,
      encoding: 'utf8',
      cacheEnabled: true,
      ...options
    };
  }
  
  /**
   * 获取所有支持的语言 (Get all supported languages)
   * @returns 语言列表的Promise (Promise of language list)
   */
  async getLanguages(): Promise<string[]> {
    try {
      const pattern = `*/*${this.options.fileExtension}`;
      const files = globSync(pattern, { 
        cwd: this.options.resourcesPath, 
        absolute: false 
      });

      if (!files || files.length === 0) {
        return [];
      }

      // 从文件路径中提取语言代码 (Extract language codes from file paths)
      const languages = new Set<string>();
      for (const file of files) {
        // 文件路径格式为: locales/en/translation.json 或 en/translation.json
        const parts = file.split('/');
        if (parts.length >= 2) {
          // 如果路径格式为 locales/en/translation.json，取第二部分
          // 如果路径格式为 en/translation.json，取第一部分
          const langIndex = parts.length >= 3 ? 1 : 0;
          languages.add(parts[langIndex]);
        }
      }

      return Array.from(languages);
    } catch (error) {
      console.error('Failed to get languages:', error);
      return [];
    }
  }
  
  /**
   * 获取所有命名空间 (Get all namespaces)
   * @returns 命名空间列表的Promise (Promise of namespace list)
   */
  async getNamespaces(): Promise<string[]> {
    try {
      const pattern = `*/*${this.options.fileExtension}`;
      const files = globSync(pattern, { 
        cwd: this.options.resourcesPath, 
        absolute: false 
      });

      if (!files || files.length === 0) {
        return [];
      }

      // 从文件路径中提取命名空间 (Extract namespaces from file paths)
      const namespaces = new Set<string>();
      for (const file of files) {
        // 文件路径格式为: locales/en/translation.json 或 en/translation.json
        const parts = file.split('/');
        if (parts.length >= 2) {
          // 获取最后一部分作为文件名
          const filename = parts[parts.length - 1];
          // 移除文件扩展名 (Remove file extension)
          const namespace = filename.replace(this.options.fileExtension as string, '');
          namespaces.add(namespace);
        }
      }

      return Array.from(namespaces);
    } catch (error) {
      console.error('Failed to get namespaces:', error);
      return [];
    }
  }
  
  /**
   * 获取资源 (Get resource)
   * @param language 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象的Promise (Promise of resource object)
   */
  async getResource(language: string, namespace: string): Promise<Record<string, any>> {
    // 检查缓存 (Check cache)
    const cacheKey = `${language}:${namespace}`;
    if (this.options.cacheEnabled && this.cache.has(cacheKey)) {
      // 返回缓存的深拷贝 (Return deep copy of cached data)
      return JSON.parse(JSON.stringify(this.cache.get(cacheKey) || {}));
    }

    // 加载资源 (Load resource)
    const resourceData = await this.loadResource(language, namespace);
    
    // 存入缓存 (Store in cache)
    if (this.options.cacheEnabled) {
      this.cache.set(cacheKey, resourceData);
    }
    
    // 返回深拷贝 (Return deep copy)
    return JSON.parse(JSON.stringify(resourceData));
  }
  
  /**
   * 保存资源 (Save resource)
   * @param language 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @param data 资源数据 (Resource data)
   * @returns void的Promise (Promise of void)
   */
  async saveResource(language: string, namespace: string, data: Record<string, any>): Promise<void> {
    const filePath = this.getResourcePath(language, namespace);
    const dir = path.dirname(filePath);

    // 确保目录存在 (Ensure directory exists)
    if (this.options.createDirectories) {
      await fs.mkdir(dir, { recursive: true });
    } else {
      try {
        await fs.access(dir);
      } catch (error) {
        throw new Error(`Directory does not exist: ${dir}`);
      }
    }

    // 写入文件 (Write to file)
    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      { encoding: this.options.encoding as BufferEncoding }
    );

    // 更新缓存 (Update cache)
    if (this.options.cacheEnabled) {
      const cacheKey = `${language}:${namespace}`;
      this.cache.set(cacheKey, data);
    }
  }
  
  /**
   * 清除缓存 (Clear cache)
   * @param language 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   */
  clearCache(language?: string, namespace?: string): void {
    if (language && namespace) {
      // 清除特定语言和命名空间的缓存 (Clear cache for specific language and namespace)
      const cacheKey = `${language}:${namespace}`;
      this.cache.delete(cacheKey);
    } else if (language) {
      // 清除特定语言的所有缓存 (Clear all caches for a specific language)
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${language}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // 清除所有缓存 (Clear all caches)
      this.cache.clear();
    }
  }
  
  /**
   * 加载资源 (Load resource)
   * @param language 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象的Promise (Promise of resource object)
   */
  private async loadResource(language: string, namespace: string): Promise<Record<string, any>> {
    try {
      const filePath = this.getResourcePath(language, namespace);
      const data = await fs.readFile(filePath, { encoding: this.options.encoding as BufferEncoding });
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }
  
  /**
   * 获取资源文件路径 (Get resource file path)
   * @param language 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 文件路径 (File path)
   */
  private getResourcePath(language: string, namespace: string): string {
    return path.resolve(
      this.options.resourcesPath,
      language,
      `${namespace}${this.options.fileExtension}`
    );
  }
}