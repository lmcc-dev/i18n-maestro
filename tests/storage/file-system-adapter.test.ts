/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import path from 'path';
import { FileSystemAdapter } from '../../src/storage/file-system-adapter';

// 模拟fs和glob模块 (Mock fs and glob modules)
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  access: vi.fn(),
}));

vi.mock('glob', () => ({
  sync: vi.fn()
}));

// 导入被模拟的模块 (Import mocked modules)
import * as fs from 'fs/promises';
import { sync as globSync } from 'glob';

describe('文件系统存储适配器测试 (File system storage adapter tests)', () => {
  // 测试资源 (Test resources)
  const mockResources = {
    en: {
      translation: {
        hello: 'Hello',
        world: 'World'
      },
      common: {
        button: {
          save: 'Save',
          cancel: 'Cancel'
        }
      }
    },
    'zh-CN': {
      translation: {
        hello: '你好',
        world: '世界'
      }
    }
  };

  // 在每个测试后重置所有模拟 (Reset all mocks after each test)
  afterEach(() => {
    vi.resetAllMocks();
  });

  // 设置fs模拟实现 (Set up fs mock implementations)
  beforeEach(() => {
    // 模拟readFile根据路径返回不同的内容 (Mock readFile to return different content based on path)
    vi.mocked(fs.readFile).mockImplementation((filePath) => {
      if (typeof filePath === 'string' && filePath.includes('en/translation')) {
        return Promise.resolve(Buffer.from(JSON.stringify(mockResources.en.translation)));
      } else if (typeof filePath === 'string' && filePath.includes('en/common')) {
        return Promise.resolve(Buffer.from(JSON.stringify(mockResources.en.common)));
      } else if (typeof filePath === 'string' && filePath.includes('zh-CN/translation')) {
        return Promise.resolve(Buffer.from(JSON.stringify(mockResources['zh-CN'].translation)));
      } else {
        return Promise.reject(new Error('File not found'));
      }
    });

    // 模拟access方法 (Mock access method)
    vi.mocked(fs.access).mockImplementation((dirPath) => {
      if (typeof dirPath === 'string' && dirPath.includes('non-existent')) {
        return Promise.reject(new Error('Directory does not exist'));
      }
      return Promise.resolve();
    });

    // 模拟glob.sync返回文件列表 (Mock glob.sync to return file list)
    vi.mocked(globSync).mockImplementation((pattern) => {
      if (typeof pattern === 'string' && pattern.includes('*/translation')) {
        return ['locales/en/translation.json', 'locales/zh-CN/translation.json'];
      } else if (typeof pattern === 'string' && pattern.includes('en/*')) {
        return ['locales/en/translation.json', 'locales/en/common.json'];
      } else if (typeof pattern === 'string' && pattern.includes('*/*')) {
        return [
          'locales/en/translation.json',
          'locales/en/common.json',
          'locales/zh-CN/translation.json'
        ];
      } else {
        return [];
      }
    });
  });

  describe('初始化测试 (Initialization tests)', () => {
    it('应该创建一个文件系统适配器实例 (should create a file system adapter instance)', () => {
      const adapter = new FileSystemAdapter({
        resourcesPath: './locales'
      });
      
      expect(adapter).toBeInstanceOf(FileSystemAdapter);
    });
    
    it('缺少resourcesPath选项时应该抛出错误 (should throw error when resourcesPath option is missing)', () => {
      expect(() => {
        // @ts-expect-error 测试缺少必需参数的情况 (Testing missing required parameter)
        new FileSystemAdapter({});
      }).toThrow('resourcesPath is required');
    });
    
    it('应该使用默认选项 (should use default options)', () => {
      const adapter = new FileSystemAdapter({
        resourcesPath: './locales'
      });
      
      // 验证默认选项 (Verify default options)
      const options = (adapter as any).options;
      expect(options.fileExtension).toBe('.json');
      expect(options.createDirectories).toBe(true);
      expect(options.encoding).toBe('utf8');
    });
  });

  describe('资源路径生成测试 (Resource path generation tests)', () => {
    it('应该生成正确的资源路径 (should generate correct resource path)', () => {
      const adapter = new FileSystemAdapter({
        resourcesPath: './locales'
      });
      
      // 使用私有方法测试路径生成 (Test path generation using private method)
      const filePath = (adapter as any).getResourcePath('en', 'translation');
      const expectedPath = path.resolve('./locales/en/translation.json');
      
      expect(filePath).toBe(expectedPath);
    });
    
    it('应该支持自定义文件扩展名 (should support custom file extension)', () => {
      const adapter = new FileSystemAdapter({
        resourcesPath: './locales',
        fileExtension: '.yaml'
      });
      
      const filePath = (adapter as any).getResourcePath('en', 'translation');
      const expectedPath = path.resolve('./locales/en/translation.yaml');
      
      expect(filePath).toBe(expectedPath);
    });
  });

  describe('语言和命名空间获取测试 (Languages and namespaces retrieval tests)', () => {
    let adapter: FileSystemAdapter;
    
    beforeEach(() => {
      adapter = new FileSystemAdapter({
        resourcesPath: './locales'
      });
    });
    
    it('应该获取所有支持的语言 (should get all supported languages)', async () => {
      const languages = await adapter.getLanguages();
      
      expect(globSync).toHaveBeenCalledWith(expect.stringContaining('*/*'), expect.any(Object));
      expect(languages).toContain('en');
      expect(languages).toContain('zh-CN');
      expect(languages.length).toBe(2);
    });
    
    it('应该获取所有命名空间 (should get all namespaces)', async () => {
      const namespaces = await adapter.getNamespaces();
      
      expect(globSync).toHaveBeenCalledWith(expect.stringContaining('*/*'), expect.any(Object));
      expect(namespaces).toContain('translation');
      expect(namespaces).toContain('common');
      expect(namespaces.length).toBe(2);
    });
    
    it('模式未匹配到文件时应返回空数组 (should return empty array when pattern matches no files)', async () => {
      // 模拟glob.sync返回空数组 (Mock glob.sync to return empty array)
      vi.mocked(globSync).mockReturnValueOnce([]);
      
      const languages = await adapter.getLanguages();
      
      expect(languages).toEqual([]);
    });
  });

  describe('资源管理测试 (Resource management tests)', () => {
    let adapter: FileSystemAdapter;
    
    beforeEach(() => {
      adapter = new FileSystemAdapter({
        resourcesPath: './locales',
        cacheEnabled: true
      });
    });
    
    it('应该加载存在的资源 (should load existing resource)', async () => {
      const resource = await adapter.getResource('en', 'translation');
      
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('en/translation.json'),
        expect.objectContaining({ encoding: 'utf8' })
      );
      
      expect(resource).toEqual(mockResources.en.translation);
    });
    
    it('加载不存在的资源时应返回空对象 (should return empty object when loading non-existent resource)', async () => {
      const resource = await adapter.getResource('fr', 'unknown');
      
      expect(resource).toEqual({});
    });
    
    it('应该保存资源 (should save resource)', async () => {
      const updatedResource = {
        hello: 'Hello updated',
        world: 'World updated',
        newKey: 'New value'
      };
      
      await adapter.saveResource('en', 'translation', updatedResource);
      
      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('en'), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('en/translation.json'),
        JSON.stringify(updatedResource, null, 2),
        expect.objectContaining({ encoding: 'utf8' })
      );
    });
    
    it('createDirectories为false且目录不存在时应抛出错误 (should throw error when createDirectories is false and directory does not exist)', async () => {
      const adapterNoCreate = new FileSystemAdapter({
        resourcesPath: './locales',
        createDirectories: false
      });
      
      // 模拟目录不存在 (Mock directory does not exist)
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('Directory does not exist'));
      
      const resource = {
        test: 'Test value'
      };
      
      await expect(adapterNoCreate.saveResource('non-existent', 'translation', resource))
        .rejects.toThrow('Directory does not exist');
    });
  });

  describe('缓存控制测试 (Cache control tests)', () => {
    let adapter: FileSystemAdapter;
    
    beforeEach(() => {
      adapter = new FileSystemAdapter({
        resourcesPath: './locales',
        cacheEnabled: true
      });
    });
    
    it('应该在数据加载后使用缓存 (should use cache after data is loaded)', async () => {
      // 首次获取资源 (First resource fetch)
      const resource1 = await adapter.getResource('en', 'translation');
      
      // 验证首次调用readFile (Verify first readFile call)
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      
      // 再次获取同一资源 (Get same resource again)
      const resource2 = await adapter.getResource('en', 'translation');
      
      // 验证没有再次调用readFile (Verify readFile was not called again)
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      
      // 修改返回的资源（不会影响缓存）(Modify returned resource (won't affect cache))
      resource2.hello = 'Modified';
      
      // 再次获取同一资源 (Get same resource yet again)
      const resource3 = await adapter.getResource('en', 'translation');
      
      // 验证返回的是原始值，而不是修改后的值 (Verify original value is returned, not the modified one)
      expect(resource3.hello).toBe('Hello');
    });
    
    it('应该清除特定语言和命名空间的缓存 (should clear cache for specific language and namespace)', async () => {
      // 首次获取资源 (First resource fetch)
      await adapter.getResource('en', 'translation');
      
      // 验证调用了一次readFile (Verify readFile was called once)
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      
      // 清除特定缓存 (Clear specific cache)
      adapter.clearCache('en', 'translation');
      
      // 再次获取资源 (Get resource again)
      await adapter.getResource('en', 'translation');
      
      // 验证readFile被再次调用 (Verify readFile was called again)
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
    
    it('应该清除特定语言的所有缓存 (should clear all caches for a specific language)', async () => {
      // 获取两个不同的资源 (Get two different resources)
      await adapter.getResource('en', 'translation');
      await adapter.getResource('en', 'common');
      
      // 验证调用了两次readFile (Verify readFile was called twice)
      expect(fs.readFile).toHaveBeenCalledTimes(2);
      
      // 重置调用计数 (Reset call count)
      vi.mocked(fs.readFile).mockClear();
      
      // 清除特定语言的所有缓存 (Clear all caches for a specific language)
      adapter.clearCache('en');
      
      // 再次获取资源 (Get resources again)
      await adapter.getResource('en', 'translation');
      await adapter.getResource('en', 'common');
      
      // 验证readFile被再次调用了两次 (Verify readFile was called twice again)
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
    
    it('应该清除所有缓存 (should clear all caches)', async () => {
      // 获取不同语言的资源 (Get resources for different languages)
      await adapter.getResource('en', 'translation');
      await adapter.getResource('zh-CN', 'translation');
      
      // 验证调用了两次readFile (Verify readFile was called twice)
      expect(fs.readFile).toHaveBeenCalledTimes(2);
      
      // 重置调用计数 (Reset call count)
      vi.mocked(fs.readFile).mockClear();
      
      // 清除所有缓存 (Clear all caches)
      adapter.clearCache();
      
      // 再次获取资源 (Get resources again)
      await adapter.getResource('en', 'translation');
      await adapter.getResource('zh-CN', 'translation');
      
      // 验证readFile被再次调用了两次 (Verify readFile was called twice again)
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('禁用缓存测试 (Cache disabled tests)', () => {
    it('禁用缓存时应该总是获取新资源 (should always get fresh resources when cache is disabled)', async () => {
      const adapterNoCache = new FileSystemAdapter({
        resourcesPath: './locales',
        cacheEnabled: false
      });
      
      // 首次获取资源 (First resource fetch)
      await adapterNoCache.getResource('en', 'translation');
      
      // 验证调用了一次readFile (Verify readFile was called once)
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      
      // 再次获取同一资源 (Get same resource again)
      await adapterNoCache.getResource('en', 'translation');
      
      // 验证readFile被再次调用 (Verify readFile was called again)
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('错误处理测试 (Error handling tests)', () => {
    let adapter: FileSystemAdapter;
    
    beforeEach(() => {
      adapter = new FileSystemAdapter({
        resourcesPath: './locales'
      });
    });
    
    it('读取文件错误时应返回空对象 (should return empty object when file read error occurs)', async () => {
      // 模拟readFile抛出错误 (Mock readFile to throw error)
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Read error'));
      
      const resource = await adapter.getResource('en', 'translation');
      
      expect(resource).toEqual({});
    });
    
    it('写入文件错误时应抛出异常 (should throw exception when file write error occurs)', async () => {
      // 模拟writeFile抛出错误 (Mock writeFile to throw error)
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('Write error'));
      
      const resource = {
        test: 'Test value'
      };
      
      await expect(adapter.saveResource('en', 'translation', resource))
        .rejects.toThrow('Write error');
    });
    
    it('JSON解析错误时应返回空对象 (should return empty object when JSON parse error occurs)', async () => {
      // 模拟readFile返回无效的JSON (Mock readFile to return invalid JSON)
      vi.mocked(fs.readFile).mockResolvedValueOnce(Buffer.from('Invalid JSON'));
      
      const resource = await adapter.getResource('en', 'translation');
      
      expect(resource).toEqual({});
    });
  });
});