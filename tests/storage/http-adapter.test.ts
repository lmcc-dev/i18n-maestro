/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpAdapter, HttpErrorType } from '../../src/storage/http-adapter';

// 模拟全局fetch函数 (Mock global fetch function)
vi.stubGlobal('fetch', vi.fn());

describe('HTTP存储适配器测试 (HTTP storage adapter tests)', () => {
  let adapter: HttpAdapter;
  const baseUrl = 'https://api.example.com/i18n/';
  
  // 模拟响应 (Mock responses)
  const mockResponses = {
    languages: ['en', 'zh-CN', 'fr'],
    namespaces: ['translation', 'common', 'validation'],
    resources: {
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
    }
  };
  
  const mockFetch = (url: string, options: RequestInit) => {
    // 解析URL路径 (Parse URL path)
    const urlPath = url.replace(baseUrl, '');
    
    // 根据URL返回不同的响应 (Return different responses based on URL)
    let responseData: any;
    let status = 200;
    
    if (urlPath === 'languages') {
      responseData = mockResponses.languages;
    } else if (urlPath === 'namespaces') {
      responseData = mockResponses.namespaces;
    } else if (urlPath.startsWith('resources/')) {
      // 从URL中提取语言和命名空间 (Extract language and namespace from URL)
      const parts = urlPath.split('/');
      if (parts.length >= 3) {
        const lang = parts[1];
        const ns = parts[2];
        
        // 检查请求方法 (Check request method)
        if (options.method === 'GET') {
          // 获取资源 (Get resource)
          if (mockResponses.resources[lang] && mockResponses.resources[lang][ns]) {
            responseData = mockResponses.resources[lang][ns];
          } else {
            status = 404;
            responseData = { error: 'Resource not found' };
          }
        } else if (options.method === 'PUT' && options.body) {
          // 保存资源 (Save resource)
          try {
            const data = JSON.parse(options.body as string);
            
            // 确保语言和命名空间存在 (Ensure language and namespace exist)
            if (!mockResponses.resources[lang]) {
              mockResponses.resources[lang] = {};
            }
            
            // 更新资源 (Update resource)
            mockResponses.resources[lang][ns] = data;
            responseData = { success: true };
          } catch (e) {
            status = 400;
            responseData = { error: 'Invalid JSON' };
          }
        }
      }
    }
    
    // 如果没有匹配的响应，返回404 (If no matching response, return 404)
    if (!responseData) {
      status = 404;
      responseData = { error: 'Not found' };
    }
    
    // 创建模拟响应 (Create mock response)
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(JSON.stringify(responseData) === JSON.stringify(responseData) ? 
        // 返回深拷贝以防止测试修改影响后续结果 (Return deep copy to prevent test modifications from affecting subsequent results)
        JSON.parse(JSON.stringify(responseData)) : responseData),
      text: () => Promise.resolve(JSON.stringify(responseData))
    } as Response);
  };
  
  // 设置模拟 (Setup mocks)
  beforeEach(() => {
    vi.resetAllMocks();
    (global.fetch as any).mockImplementation(mockFetch);
    
    // 创建适配器实例 (Create adapter instance)
    adapter = new HttpAdapter({
      baseUrl,
      allowSaving: true,
      cacheEnabled: true
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('初始化测试 (Initialization tests)', () => {
    it('应该正确创建实例 (should create instance correctly)', () => {
      expect(adapter).toBeInstanceOf(HttpAdapter);
    });
    
    it('应该在缺少baseUrl选项时抛出错误 (should throw error when baseUrl option is missing)', () => {
      expect(() => {
        new HttpAdapter({
          baseUrl: '',
          cacheEnabled: true
        });
      }).toThrow();
    });
    
    it('应该确保baseUrl末尾有斜杠 (should ensure baseUrl ends with slash)', () => {
      const adapterWithoutSlash = new HttpAdapter({
        baseUrl: 'https://api.example.com/i18n',
        cacheEnabled: true
      });
      
      // 使用私有选项测试 (Test using private options)
      expect((adapterWithoutSlash as any).options.baseUrl).toBe('https://api.example.com/i18n/');
    });
    
    it('应该使用默认选项 (should use default options)', () => {
      // 使用私有选项测试 (Test using private options)
      expect((adapter as any).options.resourcePathTemplate).toBe('resources/{{lang}}/{{ns}}');
      expect((adapter as any).options.languagesUrl).toBe('languages');
      expect((adapter as any).options.namespacesUrl).toBe('namespaces');
      expect((adapter as any).options.getMethod).toBe('GET');
      expect((adapter as any).options.saveMethod).toBe('PUT');
      expect((adapter as any).options.timeout).toBe(5000);
    });
  });
  
  describe('获取语言和命名空间测试 (Get languages and namespaces tests)', () => {
    it('应该获取所有支持的语言 (should get all supported languages)', async () => {
      const languages = await adapter.getLanguages();
      
      expect(languages).toEqual(['en', 'zh-CN', 'fr']);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}languages`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
    
    it('应该处理语言数据在对象中的情况 (should handle case when language data is in an object)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ languages: ['en', 'zh-CN'] })
      });
      
      const languages = await adapter.getLanguages();
      
      expect(languages).toEqual(['en', 'zh-CN']);
    });
    
    it('获取语言失败时应该返回空数组 (should return empty array when getting languages fails)', async () => {
      // 保存原始fetch实现
      const originalFetch = global.fetch;
      
      // 完全覆盖全局fetch
      (global.fetch as any) = vi.fn().mockImplementation((url) => {
        if (url.includes('languages')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.reject(new Error('Server error'))
          });
        }
        // 其他URL使用默认行为
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([])
        });
      });
      
      // 运行测试
      const languages = await adapter.getLanguages();
      
      // 验证结果
      expect(languages).toEqual([]);
      
      // 恢复原始fetch
      global.fetch = originalFetch;
    });
    
    it('应该获取所有命名空间 (should get all namespaces)', async () => {
      const namespaces = await adapter.getNamespaces();
      
      expect(namespaces).toEqual(['translation', 'common', 'validation']);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}namespaces`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
    
    it('应该处理命名空间数据在对象中的情况 (should handle case when namespace data is in an object)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ namespaces: ['translation', 'common'] })
      });
      
      const namespaces = await adapter.getNamespaces();
      
      expect(namespaces).toEqual(['translation', 'common']);
    });
    
    it('获取命名空间失败时应该返回空数组 (should return empty array when getting namespaces fails)', async () => {
      // 保存原始fetch实现
      const originalFetch = global.fetch;
      
      // 完全覆盖全局fetch
      (global.fetch as any) = vi.fn().mockImplementation((url) => {
        if (url.includes('namespaces')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.reject(new Error('Server error'))
          });
        }
        // 其他URL使用默认行为
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([])
        });
      });
      
      // 运行测试
      const namespaces = await adapter.getNamespaces();
      
      // 验证结果
      expect(namespaces).toEqual([]);
      
      // 恢复原始fetch
      global.fetch = originalFetch;
    });
  });
  
  describe('资源管理测试 (Resource management tests)', () => {
    it('应该加载存在的资源 (should load existing resource)', async () => {
      const resource = await adapter.getResource('en', 'translation');
      
      expect(resource).toEqual({
        hello: 'Hello',
        world: 'World'
      });
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}resources/en/translation`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
    
    it('资源不存在时应该返回空对象 (should return empty object when resource does not exist)', async () => {
      const resource = await adapter.getResource('fr', 'translation');
      
      expect(resource).toEqual({});
    });
    
    it('应该保存资源 (should save resource)', async () => {
      const data = {
        hello: 'Hello updated',
        world: 'World updated',
        newKey: 'New value'
      };
      
      await adapter.saveResource('en', 'translation', data);
      
      // 验证fetch被调用 (Verify fetch was called)
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}resources/en/translation`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data)
        })
      );
      
      // 验证资源已更新 (Verify resource was updated)
      adapter.clearCache('en', 'translation');
      const updatedResource = await adapter.getResource('en', 'translation');
      expect(updatedResource).toEqual(data);
    });
    
    it('不允许保存时应该抛出错误 (should throw error when saving is not allowed)', async () => {
      // 创建禁止保存的适配器 (Create adapter with saving disabled)
      const readOnlyAdapter = new HttpAdapter({
        baseUrl,
        allowSaving: false
      });
      
      await expect(
        readOnlyAdapter.saveResource('en', 'translation', { hello: 'Hello' })
      ).rejects.toThrow();
    });
  });
  
  describe('自定义选项测试 (Custom options tests)', () => {
    it('应该使用自定义资源URL (should use custom resource URL)', async () => {
      const customAdapter = new HttpAdapter({
        baseUrl,
        getResourceUrl: (lang, ns, baseUrl) => `${baseUrl}custom/${lang}/${ns}.json`
      });
      
      // 修改mockFetch以处理自定义URL (Modify mockFetch to handle custom URL)
      (global.fetch as any).mockImplementationOnce((url: string, options: RequestInit) => {
        expect(url).toBe(`${baseUrl}custom/en/translation.json`);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponses.resources.en.translation)
        });
      });
      
      const resource = await customAdapter.getResource('en', 'translation');
      
      expect(resource).toEqual(mockResponses.resources.en.translation);
    });
    
    it('应该使用自定义请求头 (should use custom headers)', async () => {
      const customHeaders = {
        'Authorization': 'Bearer token',
        'X-Custom-Header': 'CustomValue'
      };
      
      const customAdapter = new HttpAdapter({
        baseUrl,
        headers: customHeaders
      });
      
      await customAdapter.getResource('en', 'translation');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: customHeaders
        })
      );
    });
    
    it('应该使用自定义响应解析器 (should use custom response parser)', async () => {
      const parseResponse = vi.fn().mockResolvedValue({
        customParsed: true,
        hello: 'Custom Hello'
      });
      
      const customAdapter = new HttpAdapter({
        baseUrl,
        parseResponse
      });
      
      const resource = await customAdapter.getResource('en', 'translation');
      
      expect(parseResponse).toHaveBeenCalled();
      expect(resource).toEqual({
        customParsed: true,
        hello: 'Custom Hello'
      });
    });
    
    it('应该使用自定义错误处理器 (should use custom error handler)', async () => {
      const handleError = vi.fn().mockResolvedValue({
        errorHandled: true,
        fallback: 'Fallback value'
      });
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      const customAdapter = new HttpAdapter({
        baseUrl,
        handleError
      });
      
      const resource = await customAdapter.getResource('en', 'translation');
      
      // 使用更灵活的匹配断言，适应结构化错误对象
      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          url: expect.stringContaining('resources/en/translation'),
          type: expect.any(String)
        }),
        'en',
        'translation'
      );
      
      expect(resource).toEqual({
        errorHandled: true,
        fallback: 'Fallback value'
      });
    });
  });
  
  describe('缓存控制测试 (Cache control tests)', () => {
    it('应该在数据加载后使用缓存 (should use cache after data is loaded)', async () => {
      // 创建测试专用适配器实例 (Create adapter instance specifically for this test)
      const cacheAdapter = new HttpAdapter({
        baseUrl,
        allowSaving: true,
        cacheEnabled: true
      });
      
      // 首次获取资源 (First resource fetch)
      await cacheAdapter.getResource('en', 'translation');
      
      // 重置fetch调用计数 (Reset fetch call count)
      vi.clearAllMocks();
      
      // 修改模拟数据 (Modify mock data)
      const originalData = { ...mockResponses.resources.en.translation };
      mockResponses.resources.en.translation = {
        hello: 'Hello modified',
        world: 'World modified'
      };
      
      // 再次获取资源（应该从缓存中获取，不会触发fetch）
      // (Fetch resource again (should get from cache, won't trigger fetch))
      const resource = await cacheAdapter.getResource('en', 'translation');
      
      // 验证我们得到了原始值，而不是修改后的值
      // (Verify we got the original value, not the modified one)
      expect(resource).toEqual(originalData);
      
      // 验证fetch没有被再次调用 (Verify fetch was not called again)
      expect(global.fetch).not.toHaveBeenCalled();
      
      // 恢复原始数据 (Restore original data)
      mockResponses.resources.en.translation = originalData;
    });
    
    it('应该清除特定语言和命名空间的缓存 (should clear cache for specific language and namespace)', async () => {
      // 首次获取资源 (First resource fetch)
      await adapter.getResource('en', 'translation');
      
      // 重置fetch调用计数 (Reset fetch call count)
      vi.clearAllMocks();
      
      // 修改模拟数据 (Modify mock data)
      mockResponses.resources.en.translation = {
        hello: 'Hello modified',
        world: 'World modified'
      };
      
      // 清除特定缓存 (Clear specific cache)
      adapter.clearCache('en', 'translation');
      
      // 再次获取资源（应该刷新）(Get resource again (should be refreshed))
      const refreshedResource = await adapter.getResource('en', 'translation');
      
      // 验证我们得到了修改后的值 (Verify we got the modified value)
      expect(refreshedResource).toEqual({
        hello: 'Hello modified',
        world: 'World modified'
      });
      
      // 验证fetch被再次调用 (Verify fetch was called again)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('超时和错误处理测试 (Timeout and error handling tests)', () => {
    it('请求超时时应该返回空对象 (should return empty object when request times out)', async () => {
      // 设置更高的测试超时时间
      vi.setConfig({ testTimeout: 10000 });
      
      // 保存原始的fetch和setTimeout
      const originalFetch = global.fetch;
      const originalSetTimeout = global.setTimeout;
      
      // 模拟fetch会被超时中断
      global.fetch = vi.fn().mockImplementation((url, options) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          }, 50);
        });
      }) as any;
      
      // 创建带有较短超时的适配器
      const timeoutAdapter = new HttpAdapter({
        baseUrl,
        timeout: 10,
        // 禁用重试，保证超时立即返回
        maxRetries: 0
      });
      
      // 执行请求
      const resource = await timeoutAdapter.getResource('en', 'translation');
      
      // 验证结果为空对象
      expect(resource).toEqual({});
      
      // 恢复原始方法
      global.fetch = originalFetch;
      global.setTimeout = originalSetTimeout;
      
      // 恢复默认测试超时
      vi.setConfig({ testTimeout: 5000 });
    });
    
    it('网络错误时应该返回空对象 (should return empty object when network error occurs)', async () => {
      // 保存原始fetch实现
      const originalFetch = global.fetch;
      
      // 完全覆盖全局fetch
      (global.fetch as any) = vi.fn().mockRejectedValue(new TypeError('Network error'));
      
      // 运行测试
      const resource = await adapter.getResource('en', 'translation');
      
      // 验证结果
      expect(resource).toEqual({});
      
      // 恢复原始fetch
      global.fetch = originalFetch;
    });
    
    it('应该对网络错误进行分类 (should categorize network errors)', async () => {
      // 创建一个可以捕获错误的适配器
      const errorCaptureAdapter = new HttpAdapter({
        baseUrl,
        handleError: (error, lang, ns) => {
          // 验证错误类型
          expect(error).toHaveProperty('type', HttpErrorType.NETWORK);
          expect(error).toHaveProperty('retryable', true);
          return Promise.resolve({});
        }
      });
      
      // 模拟网络错误
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));
      
      await errorCaptureAdapter.getResource('en', 'translation');
    });
    
    it('应该对超时错误进行分类 (should categorize timeout errors)', async () => {
      // 创建一个可以捕获错误的适配器
      const errorCaptureAdapter = new HttpAdapter({
        baseUrl,
        handleError: (error, lang, ns) => {
          // 验证错误类型
          expect(error).toHaveProperty('type', HttpErrorType.TIMEOUT);
          expect(error).toHaveProperty('retryable', true);
          return Promise.resolve({});
        }
      });
      
      // 模拟超时错误
      (global.fetch as any).mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'));
      
      await errorCaptureAdapter.getResource('en', 'translation');
    });
    
    it('应该对HTTP错误进行分类 (should categorize HTTP errors)', async () => {
      // 创建一个可以捕获错误的适配器
      const errorCaptureAdapter = new HttpAdapter({
        baseUrl,
        handleError: (error, lang, ns) => {
          // 验证错误类型和状态码
          expect(error).toHaveProperty('type', HttpErrorType.NOT_FOUND);
          expect(error).toHaveProperty('status', 404);
          expect(error).toHaveProperty('retryable', false);
          return Promise.resolve({});
        }
      });
      
      // 模拟404错误
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      await errorCaptureAdapter.getResource('en', 'non-existent');
    });
  });
});