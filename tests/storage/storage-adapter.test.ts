/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseStorageAdapter, BaseStorageAdapterOptions } from '../../src/storage/storage-adapter';

// 创建模拟存储适配器扩展基类 (Create mock storage adapter extending base class)
class MockStorageAdapter extends BaseStorageAdapter {
  public resources: Record<string, Record<string, any>> = {};
  
  constructor(options?: BaseStorageAdapterOptions) {
    super(options);
  }
  
  public getLanguages(): string[] {
    return Object.keys(this.resources);
  }
  
  public getNamespaces(): string[] {
    const namespaces = new Set<string>();
    
    // 收集所有命名空间 (Collect all namespaces)
    Object.values(this.resources).forEach(langResources => {
      Object.keys(langResources).forEach(ns => namespaces.add(ns));
    });
    
    return Array.from(namespaces);
  }
  
  protected async loadResource(
    lang: string,
    namespace: string,
  ): Promise<Record<string, any>> {
    // 调用mockLoadResource并返回结果 (Call mockLoadResource and return results)
    return this.mockLoadResource(lang, namespace);
  }
  
  protected async persistResource(
    lang: string,
    namespace: string,
    data: Record<string, any>,
  ): Promise<void> {
    // 调用mockPersistResource并返回结果 (Call mockPersistResource and return results)
    return this.mockPersistResource(lang, namespace, data);
  }
  
  // 公开测试方法，这些方法会被间谍跟踪 (Expose test methods that will be spied on)
  public mockLoadResource(lang: string, namespace: string): Record<string, any> {
    // 模拟从存储加载资源 (Mock loading resource from storage)
    return this.resources[lang]?.[namespace] || {};
  }
  
  public mockPersistResource(
    lang: string,
    namespace: string,
    data: Record<string, any>,
  ): void {
    // 模拟保存资源到存储 (Mock saving resource to storage)
    if (!this.resources[lang]) {
      this.resources[lang] = {};
    }
    
    this.resources[lang][namespace] = { ...data };
  }
  
  // 添加一些帮助方法来设置测试数据 (Add some helper methods to set up test data)
  public setupTestData(): void {
    this.resources = {
      'en': {
        'translation': {
          hello: 'Hello',
          world: 'World'
        },
        'common': {
          button: {
            save: 'Save',
            cancel: 'Cancel'
          }
        }
      },
      'zh-CN': {
        'translation': {
          hello: '你好',
          world: '世界'
        }
      }
    };
  }
}

describe('基础存储适配器测试 (Base storage adapter tests)', () => {
  let adapter: MockStorageAdapter;
  
  beforeEach(() => {
    // 创建适配器实例 (Create adapter instance)
    adapter = new MockStorageAdapter({ cacheEnabled: true });
    adapter.setupTestData();
    
    // 清除所有的模拟（如果有的话）(Clear all mocks (if any))
    vi.clearAllMocks();
  });
  
  describe('基础功能测试 (Basic functionality tests)', () => {
    it('应该正确创建实例 (should create instance correctly)', () => {
      expect(adapter).toBeInstanceOf(BaseStorageAdapter);
      expect(adapter).toBeInstanceOf(MockStorageAdapter);
    });
    
    it('应该默认启用缓存 (should enable cache by default)', () => {
      const defaultAdapter = new MockStorageAdapter();
      expect((defaultAdapter as any).cacheEnabled).toBe(true);
    });
    
    it('应该支持禁用缓存 (should support disabling cache)', () => {
      const noCacheAdapter = new MockStorageAdapter({ cacheEnabled: false });
      expect((noCacheAdapter as any).cacheEnabled).toBe(false);
    });
  });
  
  describe('资源加载和保存测试 (Resource loading and saving tests)', () => {
    it('应该获取资源 (should get resource)', async () => {
      const spy = vi.spyOn(adapter, 'mockLoadResource');
      
      const resource = await adapter.getResource('en', 'translation');
      
      expect(resource).toEqual({
        hello: 'Hello',
        world: 'World'
      });
      expect(spy).toHaveBeenCalledWith('en', 'translation');
    });
    
    it('应该在缓存启用的情况下缓存资源 (should cache resources when cache is enabled)', async () => {
      const spy = vi.spyOn(adapter, 'mockLoadResource');
      
      // 首次获取资源 (First resource fetch)
      await adapter.getResource('en', 'translation');
      
      // 再次获取相同资源 (Fetch the same resource again)
      const resource = await adapter.getResource('en', 'translation');
      
      expect(resource).toEqual({
        hello: 'Hello',
        world: 'World'
      });
      
      // loadResource应该只被调用一次 (loadResource should be called only once)
      expect(spy).toHaveBeenCalledTimes(1);
    });
    
    it('应该在缓存禁用的情况下每次加载资源 (should load resources every time when cache is disabled)', async () => {
      const noCacheAdapter = new MockStorageAdapter({ cacheEnabled: false });
      noCacheAdapter.setupTestData();
      
      const spy = vi.spyOn(noCacheAdapter, 'mockLoadResource');
      
      // 首次获取资源 (First resource fetch)
      await noCacheAdapter.getResource('en', 'translation');
      
      // 再次获取相同资源 (Fetch the same resource again)
      await noCacheAdapter.getResource('en', 'translation');
      
      // loadResource应该被调用两次 (loadResource should be called twice)
      expect(spy).toHaveBeenCalledTimes(2);
    });
    
    it('应该保存资源 (should save resource)', async () => {
      const spy = vi.spyOn(adapter, 'mockPersistResource');
      
      const data = {
        hello: 'Hello updated',
        world: 'World updated',
        newKey: 'New value'
      };
      
      await adapter.saveResource('en', 'translation', data);
      
      // 验证persistResource被调用 (Verify persistResource was called)
      expect(spy).toHaveBeenCalledWith('en', 'translation', data);
      
      // 清除缓存以确保会调用loadResource (Clear cache to ensure loadResource will be called)
      adapter.clearCache('en', 'translation');
      
      // 验证加载逻辑 (Verify loading logic)
      const loadSpy = vi.spyOn(adapter, 'mockLoadResource');
      
      // 获取更新后的资源 (Get updated resource)
      const updatedResource = await adapter.getResource('en', 'translation');
      
      expect(updatedResource).toEqual(data);
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('缓存控制测试 (Cache control tests)', () => {
    it('应该清除特定语言和命名空间的缓存 (should clear cache for specific language and namespace)', async () => {
      // 填充缓存 (Populate cache)
      await adapter.getResource('en', 'translation');
      await adapter.getResource('en', 'common');
      await adapter.getResource('zh-CN', 'translation');
      
      // 修改原始数据但不通过saveResource (Modify original data but not through saveResource)
      adapter.resources.en.translation.hello = 'Modified directly';
      
      // 清除特定缓存 (Clear specific cache)
      adapter.clearCache('en', 'translation');
      
      const loadSpy = vi.spyOn(adapter, 'mockLoadResource');
      
      // 获取资源 (Get resources)
      const enTranslation = await adapter.getResource('en', 'translation');
      const enCommon = await adapter.getResource('en', 'common');
      const zhTranslation = await adapter.getResource('zh-CN', 'translation');
      
      // 修改过的资源应该被重新加载 (Modified resource should be reloaded)
      expect(enTranslation.hello).toBe('Modified directly');
      
      // 其他资源应该使用缓存 (Other resources should use cache)
      expect(loadSpy).toHaveBeenCalledTimes(1);
      expect(loadSpy).toHaveBeenCalledWith('en', 'translation');
    });
    
    it('应该清除特定语言的所有缓存 (should clear all caches for a specific language)', async () => {
      // 填充缓存 (Populate cache)
      await adapter.getResource('en', 'translation');
      await adapter.getResource('en', 'common');
      await adapter.getResource('zh-CN', 'translation');
      
      // 修改原始数据 (Modify original data)
      adapter.resources.en.translation.hello = 'Modified translation';
      adapter.resources.en.common.button.save = 'Modified save';
      
      // 清除en语言的所有缓存 (Clear all caches for en language)
      adapter.clearCache('en');
      
      const loadSpy = vi.spyOn(adapter, 'mockLoadResource');
      
      // 获取资源 (Get resources)
      const enTranslation = await adapter.getResource('en', 'translation');
      const enCommon = await adapter.getResource('en', 'common');
      const zhTranslation = await adapter.getResource('zh-CN', 'translation');
      
      // 修改过的资源应该被重新加载 (Modified resources should be reloaded)
      expect(enTranslation.hello).toBe('Modified translation');
      expect(enCommon.button.save).toBe('Modified save');
      
      // zh-CN资源应该使用缓存 (zh-CN resource should use cache)
      expect(loadSpy).toHaveBeenCalledTimes(2);
      expect(loadSpy).toHaveBeenCalledWith('en', 'translation');
      expect(loadSpy).toHaveBeenCalledWith('en', 'common');
    });
    
    it('应该清除所有缓存 (should clear all caches)', async () => {
      // 填充缓存 (Populate cache)
      await adapter.getResource('en', 'translation');
      await adapter.getResource('en', 'common');
      await adapter.getResource('zh-CN', 'translation');
      
      // 修改原始数据 (Modify original data)
      adapter.resources.en.translation.hello = 'Modified en';
      adapter.resources['zh-CN'].translation.hello = 'Modified zh';
      
      // 清除所有缓存 (Clear all caches)
      adapter.clearCache();
      
      const loadSpy = vi.spyOn(adapter, 'mockLoadResource');
      
      // 获取资源 (Get resources)
      await adapter.getResource('en', 'translation');
      await adapter.getResource('en', 'common');
      await adapter.getResource('zh-CN', 'translation');
      
      // 所有资源应该被重新加载 (All resources should be reloaded)
      expect(loadSpy).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('特殊情况测试 (Special cases tests)', () => {
    it('应该处理loadResource抛出错误的情况 (should handle case when loadResource throws error)', async () => {
      vi.spyOn(adapter, 'mockLoadResource').mockRejectedValueOnce(new Error('Mock error'));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 获取资源（应该返回空对象）(Get resource (should return empty object))
      const resource = await adapter.getResource('en', 'translation');
      
      expect(resource).toEqual({});
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
    
    it('应该处理persistResource抛出错误的情况 (should handle case when persistResource throws error)', async () => {
      vi.spyOn(adapter, 'mockPersistResource').mockRejectedValueOnce(new Error('Mock error'));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 保存资源（应该抛出错误）(Save resource (should throw error))
      await expect(
        adapter.saveResource('en', 'translation', { hello: 'Hello' })
      ).rejects.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('深拷贝测试 (Deep copy tests)', () => {
    it('应该返回资源的深拷贝而不是引用 (should return deep copy of resources, not references)', async () => {
      // 获取资源 (Get resource)
      const resource = await adapter.getResource('en', 'common');
      
      // 修改返回的资源 (Modify returned resource)
      resource.button.save = 'Modified by test';
      
      // 再次获取资源（应该得到原始值）(Get resource again (should get original value))
      const resourceAgain = await adapter.getResource('en', 'common');
      
      expect(resourceAgain.button.save).toBe('Save');
    });
  });
});