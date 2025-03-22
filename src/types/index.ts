/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * I18n配置接口 (I18n configuration interface)
 */
export interface I18nConfig {
  // 默认语言 (Default language)
  defaultLanguage: string;
  
  // 回退语言，当前语言没有翻译时使用 (Fallback language when translation is missing)
  fallbackLanguage?: string;
  
  // 支持的语言列表 (Supported languages list)
  languages: string[];
  
  // 资源路径或资源对象 (Resource path or resource object)
  resources?: Record<string, Record<string, any>> | string;
  
  // 资源加载选项 (Resource loading options)
  resourceOptions?: {
    // 命名空间列表 (Namespace list)
    namespaces?: string[];
    // 默认命名空间 (Default namespace)
    defaultNamespace?: string;
    // 加载策略：all-一次性加载所有 | lazy-按需加载 (Loading strategy)
    loadStrategy?: 'all' | 'lazy';
  };
  
  // 检测选项 (Detection options)
  detection?: {
    // 是否检查缺失键 (Whether to check missing keys)
    checkMissingKeys?: boolean;
    // 是否检查未使用键 (Whether to check unused keys)
    checkUnusedKeys?: boolean;
    // 键使用策略：error-抛出错误 | warn-警告 | silent-静默 (Key usage strategy)
    missingKeyStrategy?: 'error' | 'warn' | 'silent';
  };
  
  // 插件列表 (Plugin list)
  plugins?: I18nPlugin[];
  
  // 格式化选项 (Formatting options)
  formatting?: {
    // 日期格式化选项 (Date formatting options)
    date?: Intl.DateTimeFormatOptions | Record<string, Intl.DateTimeFormatOptions>;
    // 数字格式化选项 (Number formatting options)
    number?: Intl.NumberFormatOptions | Record<string, Intl.NumberFormatOptions>;
    // 插值选项 (Interpolation options)
    interpolation?: {
      // 前缀 (Prefix)
      prefix?: string;
      // 后缀 (Suffix)
      suffix?: string;
      // 是否转义值 (Whether to escape values)
      escapeValue?: boolean;
    };
  };
}

/**
 * I18n实例接口 (I18n instance interface)
 */
export interface I18nInstance {
  // 核心功能 (Core functions)
  t: TranslateFunction;
  setLanguage: (lang: string) => void;
  getLanguage: () => string;
  addResources: (resources: Record<string, any>, lang?: string, namespace?: string) => void;
  
  // 格式化功能 (Formatting functions)
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency: string, options?: Intl.NumberFormatOptions) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  
  // 检测功能 (Detection functions)
  getMissingKeys: () => string[];
  getUnusedKeys: () => string[];
  generateReport: () => TranslationReport;
  
  // 工具功能 (Utility functions)
  exists: (key: string, options?: ExistsOptions) => boolean;
  changeNamespace: (namespace: string) => void;
  registerPlugin: (plugin: I18nPlugin) => void;
}

/**
 * 翻译函数类型 (Translation function type)
 */
export type TranslateFunction = (key: string, options?: TranslateOptions) => string;

/**
 * 翻译选项接口 (Translation options interface)
 */
export interface TranslateOptions {
  // 命名空间 (Namespace)
  ns?: string;
  // 默认值 (Default value)
  defaultValue?: string;
  // 计数值，用于复数形式 (Count value for plurals)
  count?: number;
  // 上下文 (Context)
  context?: string;
  // 插值变量 (Interpolation variables)
  [key: string]: any;
}

/**
 * 判断键是否存在的选项 (Options for checking if a key exists)
 */
export interface ExistsOptions {
  // 命名空间 (Namespace)
  ns?: string;
  // 是否检查回退语言 (Whether to check fallback language)
  checkFallback?: boolean;
}

/**
 * 插件接口 (Plugin interface)
 */
export interface I18nPlugin {
  // 插件名称 (Plugin name)
  name: string;
  
  // 初始化方法 (Initialization method)
  init: (core: I18nCore) => void;
  
  // 语言变更处理 (Language change handler)
  onLanguageChange?: (lang: string) => void;
  
  // 翻译前处理 (Before translation handler)
  beforeTranslate?: (key: string, options: TranslateOptions) => any;
  
  // 翻译后处理 (After translation handler)
  afterTranslate?: (key: string, result: string, options: TranslateOptions) => string;
  
  // 插件自定义方法 (Plugin-specific methods)
  [key: string]: any;
}

/**
 * 事件类型枚举 (Event type enum)
 */
export enum I18nEventType {
  LANGUAGE_CHANGED = 'languageChanged',
  RESOURCES_LOADED = 'resourcesLoaded',
  RESOURCES_ADDED = 'resourcesAdded',
  MISSING_KEY = 'missingKey',
  TRANSLATION_ERROR = 'translationError',
}

/**
 * 事件接口 (Event interface)
 */
export interface I18nEvent {
  type: I18nEventType;
  payload: any;
}

/**
 * I18n核心接口 (I18n core interface)
 * 内部使用，提供给插件扩展功能
 */
export interface I18nCore extends I18nInstance {
  // 核心配置 (Core configuration)
  config: I18nConfig;
  
  // 事件相关 (Event related)
  on(type: I18nEventType, listener: (event: I18nEvent) => void): void;
  off(type: I18nEventType, listener: (event: I18nEvent) => void): void;
  emit(type: I18nEventType, payload: any): void;
  
  // 资源相关 (Resource related)
  getResourceStore(): Record<string, Record<string, Record<string, any>>>;
}

/**
 * 存储适配器接口 (Storage adapter interface)
 */
export interface StorageAdapter {
  // 获取资源 (Get resource)
  getResource: (lang: string, namespace: string) => Promise<Record<string, any>> | Record<string, any>;
  
  // 保存资源 (Save resource)
  saveResource?: (lang: string, namespace: string, data: Record<string, any>) => Promise<void> | void;
  
  // 获取所有支持的语言 (Get all supported languages)
  getLanguages?: () => Promise<string[]> | string[];
  
  // 获取所有命名空间 (Get all namespaces)
  getNamespaces?: () => Promise<string[]> | string[];
}

/**
 * 格式化器接口 (Formatter interface)
 */
export interface Formatter<T = any> {
  // 格式化方法 (Format method)
  format: (value: T, options?: any) => string;
}

/**
 * 翻译报告接口 (Translation report interface)
 */
export interface TranslationReport {
  // 项目信息 (Project information)
  project: {
    name: string;
    version: string;
  };
  
  // 语言统计 (Language statistics)
  languages: Record<string, {
    totalKeys: number;
    missingKeys: number;
    completionRate: number;
  }>;
  
  // 命名空间统计 (Namespace statistics)
  namespaces: Record<string, {
    totalKeys: number;
    keysByLanguage: Record<string, number>;
  }>;
  
  // 问题列表 (Issues list)
  issues: {
    missingKeys: Array<{
      key: string;
      namespace: string;
      languages: string[];
    }>;
    unusedKeys: Array<{
      key: string;
      namespace: string;
      languages: string[];
    }>;
  };
  
  // 生成时间 (Generation time)
  generatedAt: Date;
}