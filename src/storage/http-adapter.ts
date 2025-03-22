/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { BaseStorageAdapter, BaseStorageAdapterOptions } from './storage-adapter';

/**
 * HTTP错误类型枚举 (HTTP error type enum)
 */
export enum HttpErrorType {
  NETWORK = 'network',    // 网络错误 (Network error)
  TIMEOUT = 'timeout',    // 超时错误 (Timeout error)
  AUTH = 'authentication', // 认证错误 (Authentication error)
  NOT_FOUND = 'not_found', // 资源不存在 (Resource not found)
  SERVER = 'server',      // 服务器错误 (Server error)
  PARSE = 'parse',        // 解析错误 (Parse error)
  UNKNOWN = 'unknown'     // 未知错误 (Unknown error)
}

/**
 * 结构化HTTP错误对象 (Structured HTTP error object)
 */
export interface HttpAdapterError {
  type: HttpErrorType;      // 错误类型 (Error type)
  message: string;          // 错误消息 (Error message)
  url: string;              // 请求URL (Request URL)
  status?: number;          // HTTP状态码 (HTTP status code)
  retryable: boolean;       // 是否可重试 (Whether retryable)
  originalError?: any;      // 原始错误对象 (Original error object)
}

/**
 * HTTP存储适配器选项 (HTTP storage adapter options)
 */
export interface HttpAdapterOptions extends BaseStorageAdapterOptions {
  /**
   * API基础URL (API base URL)
   */
  baseUrl: string;
  
  /**
   * 资源路径模板 (Resource path template)
   * 可以使用 {{lang}} 和 {{ns}} 作为占位符
   * (Can use {{lang}} and {{ns}} as placeholders)
   * @default "resources/{{lang}}/{{ns}}"
   */
  resourcePathTemplate?: string;
  
  /**
   * 语言列表URL (Languages list URL)
   * @default "languages"
   */
  languagesUrl?: string;
  
  /**
   * 命名空间列表URL (Namespaces list URL)
   * @default "namespaces"
   */
  namespacesUrl?: string;
  
  /**
   * 获取资源的HTTP方法 (HTTP method for getting resources)
   * @default "GET"
   */
  getMethod?: string;
  
  /**
   * 保存资源的HTTP方法 (HTTP method for saving resources)
   * @default "PUT"
   */
  saveMethod?: string;
  
  /**
   * 自定义请求头 (Custom request headers)
   */
  headers?: Record<string, string>;
  
  /**
   * 请求超时毫秒数 (Request timeout in milliseconds)
   * @default 5000
   */
  timeout?: number;
  
  /**
   * 是否允许保存资源 (Whether to allow saving resources)
   * @default false
   */
  allowSaving?: boolean;
  
  /**
   * 自定义获取URL的函数 (Custom function to get URL)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @param baseUrl 基础URL (Base URL)
   * @returns 完整URL (Complete URL)
   */
  getResourceUrl?: (lang: string, namespace: string, baseUrl: string) => string;
  
  /**
   * 自定义解析响应的函数 (Custom function to parse response)
   * @param response 响应对象 (Response object)
   * @returns 资源对象的Promise (Promise of resource object)
   */
  parseResponse?: (response: Response) => Promise<Record<string, any>>;
  
  /**
   * 自定义错误处理函数 (Custom error handling function)
   * @param error 错误对象 (Error object)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象的Promise (Promise of resource object)
   */
  handleError?: (error: any, lang: string, namespace: string) => Promise<Record<string, any>>;
  
  /**
   * 最大重试次数 (Maximum retry attempts)
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * 初始重试延迟毫秒数 (Initial retry delay in milliseconds)
   * @default 300
   */
  retryDelay?: number;
  
  /**
   * 是否启用指数退避重试策略 (Whether to use exponential backoff retry strategy)
   * @default true
   */
  useExponentialBackoff?: boolean;
  
  /**
   * 是否自动处理HTTP状态码错误 (Whether to automatically handle HTTP status code errors)
   * @default true
   */
  autoHandleStatusErrors?: boolean;
}

/**
 * HTTP存储适配器 - 从HTTP服务器加载和保存资源
 * (HTTP storage adapter - loads and saves resources from HTTP server)
 * 
 * 该适配器允许从远程HTTP服务器读取和写入翻译资源
 * (This adapter allows reading and writing translation resources from a remote HTTP server)
 */
export class HttpAdapter extends BaseStorageAdapter {
  // 改为protected解决私有性不一致问题
  protected options: HttpAdapterOptions;
  
  /**
   * 构造函数 (Constructor)
   * @param options HTTP适配器选项 (HTTP adapter options)
   */
  constructor(options: HttpAdapterOptions) {
    super(options);
    
    // 合并默认选项 (Merge default options)
    this.options = {
      resourcePathTemplate: 'resources/{{lang}}/{{ns}}',
      languagesUrl: 'languages',
      namespacesUrl: 'namespaces',
      getMethod: 'GET',
      saveMethod: 'PUT',
      timeout: 5000,
      allowSaving: false,
      maxRetries: 3,
      retryDelay: 300,
      useExponentialBackoff: true,
      autoHandleStatusErrors: true,
      ...options,
    };
    
    // 确保baseUrl存在 (Ensure baseUrl exists)
    if (!this.options.baseUrl) {
      throw new Error('baseUrl选项是必需的');
    }
    
    // 确保baseUrl末尾有斜杠 (Ensure baseUrl ends with slash)
    if (!this.options.baseUrl.endsWith('/')) {
      this.options.baseUrl += '/';
    }
  }
  
  /**
   * 获取所有支持的语言 (Get all supported languages)
   * @returns 语言列表的Promise (Promise of language list)
   */
  public async getLanguages(): Promise<string[]> {
    try {
      const url = `${this.options.baseUrl}${this.options.languagesUrl}`;
      const response = await this.fetchWithTimeout(url, {
        method: this.options.getMethod,
        headers: this.options.headers,
      });
      
      if (!response.ok) {
        throw new Error(`获取语言列表失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 根据返回的数据结构提取语言列表
      // (Extract language list based on the returned data structure)
      if (Array.isArray(data)) {
        return data;
      } else if (data.languages && Array.isArray(data.languages)) {
        return data.languages;
      } else {
        console.warn('意外的语言列表格式:', data);
        return [];
      }
    } catch (error) {
      console.error('获取语言列表失败:', error);
      return [];
    }
  }
  
  /**
   * 获取所有命名空间 (Get all namespaces)
   * @returns 命名空间列表的Promise (Promise of namespace list)
   */
  public async getNamespaces(): Promise<string[]> {
    try {
      const url = `${this.options.baseUrl}${this.options.namespacesUrl}`;
      const response = await this.fetchWithTimeout(url, {
        method: this.options.getMethod,
        headers: this.options.headers,
      });
      
      if (!response.ok) {
        throw new Error(`获取命名空间列表失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 根据返回的数据结构提取命名空间列表
      // (Extract namespace list based on the returned data structure)
      if (Array.isArray(data)) {
        return data;
      } else if (data.namespaces && Array.isArray(data.namespaces)) {
        return data.namespaces;
      } else {
        console.warn('意外的命名空间列表格式:', data);
        return [];
      }
    } catch (error) {
      console.error('获取命名空间列表失败:', error);
      return [];
    }
  }
  
  /**
   * 加载资源 (Load resource)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 资源对象的Promise (Promise of resource object)
   */
  protected async loadResource(
    lang: string,
    namespace: string,
  ): Promise<Record<string, any>> {
    try {
      // 获取资源URL (Get resource URL)
      const url = this.getResourceUrl(lang, namespace);
      
      // 发送请求 (Send request)
      const response = await this.fetchWithTimeout(url, {
        method: this.options.getMethod,
        headers: this.options.headers,
      });
      
      if (!response.ok) {
        throw this.createHttpError(
          response.status,
          `加载资源失败: ${response.status} ${response.statusText}`,
          url
        );
      }
      
      // 解析响应 (Parse response)
      if (this.options.parseResponse) {
        return this.options.parseResponse(response);
      } else {
        try {
          return await response.json();
        } catch (parseError) {
          throw this.createError(
            parseError,
            url,
            HttpErrorType.PARSE,
            '解析响应数据失败'
          );
        }
      }
    } catch (error) {
      // 处理错误 (Handle error)
      if (this.options.handleError) {
        return this.options.handleError(error, lang, namespace);
      } else {
        console.error(`加载资源失败 [${lang}:${namespace}]:`, error);
        return {};
      }
    }
  }
  
  /**
   * 保存资源 (Save resource)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @param data 资源数据 (Resource data)
   * @returns void的Promise (Promise of void)
   */
  protected async persistResource(
    lang: string,
    namespace: string,
    data: Record<string, any>,
  ): Promise<void> {
    // 如果不允许保存，抛出错误 (If saving is not allowed, throw error)
    if (!this.options.allowSaving) {
      throw new Error('HTTP适配器不允许保存资源。设置allowSaving=true以启用此功能。');
    }
    
    try {
      // 获取资源URL (Get resource URL)
      const url = this.getResourceUrl(lang, namespace);
      
      // 发送请求 (Send request)
      const response = await this.fetchWithTimeout(url, {
        method: this.options.saveMethod,
        headers: {
          'Content-Type': 'application/json',
          ...this.options.headers,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw this.createHttpError(
          response.status,
          `保存资源失败: ${response.status} ${response.statusText}`,
          url
        );
      }
    } catch (error) {
      console.error(`保存资源失败 [${lang}:${namespace}]:`, error);
      throw error;
    }
  }
  
  /**
   * 获取资源URL (Get resource URL)
   * @param lang 语言 (Language)
   * @param namespace 命名空间 (Namespace)
   * @returns 完整URL (Complete URL)
   */
  private getResourceUrl(lang: string, namespace: string): string {
    // 如果有自定义获取URL的函数，使用它
    // (If there's a custom function to get URL, use it)
    if (this.options.getResourceUrl) {
      return this.options.getResourceUrl(lang, namespace, this.options.baseUrl);
    }
    
    // 否则使用模板 (Otherwise use template)
    let path = this.options.resourcePathTemplate as string;
    path = path.replace(/{{lang}}/g, encodeURIComponent(lang));
    path = path.replace(/{{ns}}/g, encodeURIComponent(namespace));
    
    return `${this.options.baseUrl}${path}`;
  }
  
  /**
   * 带超时和重试的fetch (Fetch with timeout and retry)
   * @param url 请求URL (Request URL)
   * @param options 请求选项 (Request options)
   * @param retries 剩余重试次数 (Remaining retry attempts)
   * @param delay 重试延迟毫秒数 (Retry delay in milliseconds)
   * @returns Response的Promise (Promise of Response)
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    retries: number = this.options.maxRetries || 3,
    delay: number = this.options.retryDelay || 300,
  ): Promise<Response> {
    const timeout = this.options.timeout;
    
    try {
      // 创建AbortController用于超时控制
      // (Create AbortController for timeout control)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // 如果需要自动处理HTTP状态码错误并且是可重试的错误
      // (If automatic handling of HTTP status code errors is enabled and it's a retryable error)
      if (
        this.options.autoHandleStatusErrors && 
        !response.ok && 
        retries > 0 && 
        this.isRetryableStatusCode(response.status)
      ) {
        // 等待一段时间后重试 (Wait before retrying)
        const nextDelay = this.options.useExponentialBackoff ? delay * 2 : delay;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.fetchWithTimeout(url, options, retries - 1, nextDelay);
      }
      
      return response;
    } catch (error) {
      // 判断是否是超时错误或网络错误 (Check if it's a timeout error or network error)
      const isTimeoutError = error instanceof DOMException && error.name === 'AbortError';
      const isNetworkError = error instanceof TypeError && /fetch|network/i.test(error.message as string);
      
      // 如果是可重试的错误并且还有重试次数 (If it's a retryable error and there are retry attempts left)
      if ((isTimeoutError || isNetworkError) && retries > 0) {
        // 等待一段时间后重试 (Wait before retrying)
        const nextDelay = this.options.useExponentialBackoff ? delay * 2 : delay;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.fetchWithTimeout(url, options, retries - 1, nextDelay);
      }
      
      // 若是超时错误，添加明确标识 (If it's a timeout error, add clear identification)
      if (isTimeoutError) {
        const timeoutError = new Error(`请求超时: 超过${timeout}毫秒`);
        timeoutError.name = 'TimeoutError';
        throw this.createError(timeoutError, url, HttpErrorType.TIMEOUT);
      }
      
      // 其他错误，重新抛出并包含结构化信息
      // (Other errors, rethrow with structured information)
      throw this.createError(
        error, 
        url, 
        isNetworkError ? HttpErrorType.NETWORK : HttpErrorType.UNKNOWN
      );
    }
  }
  
  /**
   * 判断状态码是否可重试 (Determine if status code is retryable)
   * @param statusCode HTTP状态码 (HTTP status code)
   * @returns 是否可重试 (Whether retryable)
   */
  private isRetryableStatusCode(statusCode: number): boolean {
    // 5xx错误（服务器错误）和429（请求过多）可以重试
    // (5xx errors (server errors) and 429 (too many requests) are retryable)
    return statusCode >= 500 || statusCode === 429;
  }
  
  /**
   * 根据HTTP状态码创建结构化错误对象 (Create structured error object based on HTTP status code)
   * @param statusCode HTTP状态码 (HTTP status code)
   * @param message 错误消息 (Error message)
   * @param url 请求URL (Request URL)
   * @returns 结构化错误对象 (Structured error object)
   */
  private createHttpError(
    statusCode: number,
    message: string,
    url: string
  ): HttpAdapterError {
    let type = HttpErrorType.UNKNOWN;
    let retryable = false;
    
    if (statusCode === 404) {
      type = HttpErrorType.NOT_FOUND;
      retryable = false;
    } else if (statusCode === 401 || statusCode === 403) {
      type = HttpErrorType.AUTH;
      retryable = false;
    } else if (statusCode >= 500) {
      type = HttpErrorType.SERVER;
      retryable = true;
    }
    
    return {
      type,
      message,
      url,
      status: statusCode,
      retryable
    };
  }
  
  /**
   * 创建结构化错误对象 (Create structured error object)
   * @param error 原始错误对象 (Original error object)
   * @param url 请求URL (Request URL)
   * @param type 错误类型 (Error type)
   * @param customMessage 自定义错误消息 (Custom error message)
   * @returns 结构化错误对象 (Structured error object)
   */
  private createError(
    error: any,
    url: string,
    type = HttpErrorType.UNKNOWN,
    customMessage?: string
  ): HttpAdapterError {
    // 设置默认值 (Set default values)
    let errorType = type;
    let retryable = false;
    let status = undefined;
    let message = customMessage || (error.message || '未知错误');
    
    // 根据错误类型设置特定属性 (Set specific properties based on error type)
    if (type === HttpErrorType.TIMEOUT) {
      retryable = true;
    } else if (type === HttpErrorType.NETWORK) {
      retryable = true;
      message = customMessage || '网络连接失败';
    } else if (type === HttpErrorType.PARSE) {
      retryable = false;
      message = customMessage || '解析响应数据失败';
    }
    
    return {
      type: errorType,
      message,
      url,
      status,
      retryable,
      originalError: error
    };
  }
}