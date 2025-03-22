/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAdapter } from '../../src/storage/memory-adapter';

describe('内存存储适配器测试 (Memory storage adapter tests)', () => {
  describe('初始化测试 (Initialization tests)', () => {
    it('应该创建一个空的内存适配器 (should create an empty memory adapter)', () => {
      const adapter = new MemoryAdapter();
      expect(adapter).toBeInstanceOf(MemoryAdapter);
      expect(adapter.getLanguages()).toEqual([]);
      expect(adapter.getNamespaces()).toEqual([]);
    });
    
    it('应该使用初始资源创建适配器 (should create adapter with initial resources)', () => {
      const initialResources = {
        en: {
          translation: {
            hello: 'Hello',
            world: 'World'
          }
        }
      };
      
      const adapter = new MemoryAdapter({
        initialResources
      });
      
      expect(adapter.getLanguages()).toEqual(['en']);
      expect(adapter.getNamespaces()).toEqual(['translation']);
      
      const resource = adapter.getResource('en', 'translation');
      expect(resource).toEqual({
        hello: 'Hello',
        world: 'World'
      });
    });
  });
  
  describe('资源管理测试 (Resource management tests)', () => {
    let adapter: MemoryAdapter;
    
    beforeEach(() => {
      adapter = new MemoryAdapter({
        cacheEnabled: true,
        initialResources: {
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
        }
      });
    });
    
    it('应该获取所有支持的语言 (should get all supported languages)', () => {
      const languages = adapter.getLanguages();
      
      expect(languages).toContain('en');
      expect(languages).toContain('zh-CN');
      expect(languages.length).toBe(2);
    });
    
    it('应该获取所有命名空间 (should get all namespaces)', () => {
      const namespaces = adapter.getNamespaces();
      
      expect(namespaces).toContain('translation');
      expect(namespaces).toContain('common');
      expect(namespaces.length).toBe(2);
    });
    
    it('应该获取特定语言和命名空间的资源 (should get resources for specific language and namespace)', () => {
      const resource = adapter.getResource('en', 'translation');
      
      expect(resource).toEqual({
        hello: 'Hello',
        world: 'World'
      });
    });
    
    it('对于不存在的资源应该返回空对象 (should return empty object for non-existent resources)', () => {
      const resource = adapter.getResource('fr', 'translation');
      
      expect(resource).toEqual({});
    });
    
    it('应该在数据加载后使用缓存 (should use cache after data is loaded)', () => {
      // 首次获取资源 (First resource fetch)
      const resource1 = adapter.getResource('en', 'translation');
      expect(resource1).toEqual({
        hello: 'Hello',
        world: 'World'
      });
      
      // 保存原始值用于比较 (Save original values for comparison)
      const originalHello = resource1.hello;
      
      // 获取资源的深拷贝 (Get a deep copy of the resource)
      const resource2 = adapter.getResource('en', 'translation');
      
      // 修改资源 (Modify resource)
      resource2.hello = 'Modified';
      
      // 再次获取资源，确保我们得到原始值而不是修改后的值
      // (Get resource again, ensure we get the original value not the modified one)
      const resource3 = adapter.getResource('en', 'translation');
      
      // 验证我们得到了原始值，而不是修改后的值
      // (Verify we got the original value, not the modified one)
      expect(resource3.hello).toBe(originalHello);
    });
    
    it('应该更新现有资源 (should update existing resources)', () => {
      const updatedResource = {
        hello: 'Hello updated',
        world: 'World updated',
        newKey: 'New value'
      };
      
      // 保存更新的资源 (Save updated resource)
      adapter.saveResource('en', 'translation', updatedResource);
      
      // 获取资源 (Get resource)
      const resource = adapter.getResource('en', 'translation');
      
      // 验证资源已更新 (Verify resource was updated)
      expect(resource).toEqual(updatedResource);
    });
    
    it('应该清除所有资源 (should clear all resources)', () => {
      // 清除所有资源 (Clear all resources)
      adapter.clearResources();
      
      // 验证语言和命名空间列表为空 (Verify languages and namespaces lists are empty)
      expect(adapter.getLanguages()).toEqual([]);
      expect(adapter.getNamespaces()).toEqual([]);
      
      // 验证资源不存在 (Verify resources don't exist)
      expect(adapter.getResource('en', 'translation')).toEqual({});
    });
    
    it('应该设置初始资源并覆盖现有资源 (should set initial resources and override existing ones)', () => {
      const newResources = {
        fr: {
          translation: {
            hello: 'Bonjour',
            world: 'Monde'
          }
        }
      };
      
      // 设置新的初始资源 (Set new initial resources)
      adapter.setInitialResources(newResources);
      
      // 验证语言和命名空间列表 (Verify languages and namespaces lists)
      expect(adapter.getLanguages()).toEqual(['fr']);
      expect(adapter.getNamespaces()).toEqual(['translation']);
      
      // 验证原有资源被覆盖 (Verify original resources were overridden)
      expect(adapter.getResource('en', 'translation')).toEqual({});
      
      // 验证新资源可以访问 (Verify new resources are accessible)
      expect(adapter.getResource('fr', 'translation')).toEqual({
        hello: 'Bonjour',
        world: 'Monde'
      });
    });
  });
  
  describe('缓存控制测试 (Cache control tests)', () => {
    let adapter: MemoryAdapter;
    
    beforeEach(() => {
      adapter = new MemoryAdapter({
        cacheEnabled: true,
        initialResources: {
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
          }
        }
      });
    });
    
    it('应该清除特定语言和命名空间的缓存 (should clear cache for specific language and namespace)', () => {
      // 首次获取资源 (First resource fetch)
      const resource1 = adapter.getResource('en', 'translation');
      
      // 修改内部资源数据 (Modify internal resource data)
      const internalData = (adapter as any).resources.en.translation;
      const originalHello = internalData.hello;
      internalData.hello = 'Modified';
      
      // 清除特定缓存 (Clear specific cache)
      adapter.clearCache('en', 'translation');
      
      // 再次获取资源 (Get resource again)
      const resource2 = adapter.getResource('en', 'translation');
      
      // 应该获取到修改后的值 (Should get modified value)
      expect(resource2.hello).toBe('Modified');
      
      // 恢复原始值 (Restore original value)
      internalData.hello = originalHello;
    });
    
    it('应该清除特定语言的所有缓存 (should clear all caches for a specific language)', () => {
      // 获取所有资源以填充缓存 (Get all resources to fill cache)
      const resource1 = adapter.getResource('en', 'translation');
      const resource2 = adapter.getResource('en', 'common');
      
      // 修改内部资源数据 (Modify internal resource data)
      const internalTranslation = (adapter as any).resources.en.translation;
      const internalCommon = (adapter as any).resources.en.common;
      
      const originalTranslationHello = internalTranslation.hello;
      const originalCommonSave = internalCommon.button.save;
      
      internalTranslation.hello = 'Modified translation';
      internalCommon.button.save = 'Modified save';
      
      // 清除特定语言的所有缓存 (Clear all caches for a specific language)
      adapter.clearCache('en');
      
      // 再次获取资源 (Get resources again)
      const resource3 = adapter.getResource('en', 'translation');
      const resource4 = adapter.getResource('en', 'common');
      
      // 应该获取到修改后的值 (Should get modified values)
      expect(resource3.hello).toBe('Modified translation');
      expect(resource4.button.save).toBe('Modified save');
      
      // 恢复原始值 (Restore original values)
      internalTranslation.hello = originalTranslationHello;
      internalCommon.button.save = originalCommonSave;
    });
    
    it('应该清除所有缓存 (should clear all caches)', () => {
      // 获取所有资源以填充缓存 (Get all resources to fill cache)
      const resource1 = adapter.getResource('en', 'translation');
      const resource2 = adapter.getResource('en', 'common');
      
      // 修改内部资源数据 (Modify internal resource data)
      const internalTranslation = (adapter as any).resources.en.translation;
      const internalCommon = (adapter as any).resources.en.common;
      
      const originalTranslationHello = internalTranslation.hello;
      const originalCommonSave = internalCommon.button.save;
      
      internalTranslation.hello = 'Modified translation';
      internalCommon.button.save = 'Modified save';
      
      // 清除所有缓存 (Clear all caches)
      adapter.clearCache();
      
      // 再次获取资源 (Get resources again)
      const resource3 = adapter.getResource('en', 'translation');
      const resource4 = adapter.getResource('en', 'common');
      
      // 应该获取到修改后的值 (Should get modified values)
      expect(resource3.hello).toBe('Modified translation');
      expect(resource4.button.save).toBe('Modified save');
      
      // 恢复原始值 (Restore original values)
      internalTranslation.hello = originalTranslationHello;
      internalCommon.button.save = originalCommonSave;
    });
  });
  
  describe('缓存禁用测试 (Cache disabled tests)', () => {
    it('禁用缓存时应该总是获取新资源 (should always get fresh resources when cache is disabled)', () => {
      // 创建禁用缓存的适配器 (Create adapter with cache disabled)
      const adapter = new MemoryAdapter({
        cacheEnabled: false,
        initialResources: {
          en: {
            translation: {
              hello: 'Hello',
              world: 'World'
            }
          }
        }
      });
      
      // 首次获取资源 (First resource fetch)
      const resource1 = adapter.getResource('en', 'translation');
      
      // 修改内部资源数据 (Modify internal resource data)
      const internalData = (adapter as any).resources.en.translation;
      internalData.hello = 'Modified';
      
      // 再次获取资源 (Get resource again)
      const resource2 = adapter.getResource('en', 'translation');
      
      // 应该获取到修改后的值 (Should get modified value)
      expect(resource2.hello).toBe('Modified');
    });
  });
});