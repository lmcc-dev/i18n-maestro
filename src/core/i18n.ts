/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { ResourceManager } from './resource-manager';
import { InterpolationFormatter } from '../formatters/interpolation-formatter';
import { DateFormatter } from '../formatters/date-formatter';
import { NumberFormatter } from '../formatters/number-formatter';

import { 
  I18nConfig, 
  I18nCore, 
  I18nEventType, 
  I18nEvent,
  TranslateOptions, 
  ExistsOptions, 
  I18nPlugin,
  TranslationReport,
} from '../types';
import { EventManager } from '../utils/event-manager';
import { ConfigValidator } from '../utils/config-validator';
import { TranslationUtils } from '../utils/translation-utils';

/**
 * I18n 核心实现类 (Core implementation of I18n)
 */
export class I18n implements I18nCore {
  private currentLanguage: string;
  private currentNamespace: string;
  private resourceManager: ResourceManager;
  private eventManager: EventManager;
  private dateFormatter: DateFormatter;
  private numberFormatter: NumberFormatter;
  private interpolationFormatter: InterpolationFormatter;
  private plugins: I18nPlugin[] = [];
  private missingKeys: Set<string> = new Set();
  private usedKeys: Set<string> = new Set();

  /**
   * 构造函数 (Constructor)
   * @param config I18n配置 (I18n configuration)
   */
  constructor(public config: I18nConfig) {
    // 验证配置 (Validate configuration)
    ConfigValidator.validate(config);
    
    // 初始化变量 (Initialize variables)
    this.currentLanguage = config.defaultLanguage;
    this.currentNamespace = config.resourceOptions?.defaultNamespace || 'translation';
    
    // 初始化事件管理器 (Initialize event manager)
    this.eventManager = new EventManager();
    
    // 初始化资源管理器 (Initialize resource manager)
    this.resourceManager = new ResourceManager(config);
    
    // 初始化格式化器 (Initialize formatters)
    this.dateFormatter = new DateFormatter(this.currentLanguage);
    this.numberFormatter = new NumberFormatter(this.currentLanguage);
    this.interpolationFormatter = new InterpolationFormatter({
      prefix: config.formatting?.interpolation?.prefix || '{',
      suffix: config.formatting?.interpolation?.suffix || '}',
      escapeValue: config.formatting?.interpolation?.escapeValue !== false,
    });
    
    // 注册插件 (Register plugins)
    if (config.plugins && config.plugins.length > 0) {
      for (const plugin of config.plugins) {
        this.registerPlugin(plugin);
      }
    }
    
    // 如果资源直接在配置中提供，则加载它们 (If resources are provided in config, load them)
    if (typeof config.resources === 'object') {
      this.resourceManager.addResourcesFromObject(config.resources);
    }
  }

  /**
   * 获取指定键的翻译 (Get translation for a specified key)
   * @param key 翻译键 (Translation key)
   * @param options 翻译选项 (Translation options)
   * @returns 翻译后的文本 (Translated text)
   */
  t(key: string, options: TranslateOptions = {}): string {
    // 记录使用的键 (Record used key)
    this.usedKeys.add(key);
    
    // 获取当前使用的命名空间 (Get current namespace)
    const namespace = options.ns || this.currentNamespace;
    
    // 执行插件的翻译前处理 (Execute plugins' before-translation processing)
    for (const plugin of this.plugins) {
      if (plugin.beforeTranslate) {
        const result = plugin.beforeTranslate(key, options);
        if (result) {
          key = result.key || key;
          options = result.options || options;
        }
      }
    }
    
    // 尝试获取翻译 (Try to get translation)
    let translation = this.resourceManager.getTranslation(
      this.currentLanguage, 
      namespace, 
      key,
    );
    
    // 如果没有找到翻译且设置了回退语言，则尝试使用回退语言 
    // (If translation is not found and fallback language is set, try using fallback language)
    if (!translation && this.config.fallbackLanguage) {
      translation = this.resourceManager.getTranslation(
        this.config.fallbackLanguage, 
        namespace, 
        key,
      );
    }
    
    // 如果仍然没有找到翻译 (If translation is still not found)
    if (!translation) {
      // 记录缺失的键 (Record missing key)
      this.missingKeys.add(key);
      
      // 根据策略处理缺失键 (Handle missing key according to strategy)
      if (this.config.detection?.missingKeyStrategy === 'error') {
        throw new Error(`Translation key not found: ${key}`);
      } else if (this.config.detection?.missingKeyStrategy === 'warn') {
        console.warn(`Translation key not found: ${key}`);
      }
      
      // 触发缺失键事件 (Emit missing key event)
      this.emit(I18nEventType.MISSING_KEY, { key, namespace });
      
      // 使用默认值或键名作为翻译 (Use default value or key name as translation)
      translation = options.defaultValue || key;
    }
    
    // 处理复数形式 (Handle plural forms)
    if (options.count !== undefined && typeof translation === 'object') {
      translation = TranslationUtils.getPluralForm(translation, options.count);
    }
    
    // 处理上下文 (Handle context)
    if (options.context && typeof translation === 'object') {
      translation = translation[options.context] || translation._default || key;
    }
    
    // 确保我们有字符串类型的翻译 (Ensure we have a string translation)
    if (typeof translation !== 'string') {
      // 如果是对象但没有合适的键，返回键名或默认值 
      // (If it's an object but with no suitable key, return key name or default value)
      translation = options.defaultValue || key;
    }
    
    // 执行插值 (Perform interpolation)
    translation = this.interpolationFormatter.format(translation, options);
    
    // 执行插件的翻译后处理 (Execute plugins' after-translation processing)
    for (const plugin of this.plugins) {
      if (plugin.afterTranslate) {
        translation = plugin.afterTranslate(key, translation, options);
      }
    }
    
    return translation;
  }

  /**
   * 设置当前语言 (Set current language)
   * @param lang 语言代码 (Language code)
   */
  setLanguage(lang: string): void {
    if (!this.config.languages.includes(lang)) {
      console.warn(`Language ${lang} is not in the configured languages list.`);
    }
    
    const oldLang = this.currentLanguage;
    this.currentLanguage = lang;
    
    // 更新格式化器的语言 (Update formatters' language)
    this.dateFormatter.setLocale(lang);
    this.numberFormatter.setLocale(lang);
    
    // 触发语言变更事件 (Emit language change event)
    this.emit(I18nEventType.LANGUAGE_CHANGED, { oldLanguage: oldLang, newLanguage: lang });
    
    // 通知插件语言变更 (Notify plugins of language change)
    for (const plugin of this.plugins) {
      if (plugin.onLanguageChange) {
        plugin.onLanguageChange(lang);
      }
    }
  }

  /**
   * 获取当前语言 (Get current language)
   * @returns 当前语言代码 (Current language code)
   */
  getLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * 添加翻译资源 (Add translation resources)
   * @param resources 资源对象 (Resource object)
   * @param lang 语言代码，默认为当前语言 (Language code, defaults to current language)
   * @param namespace 命名空间，默认为当前命名空间 (Namespace, defaults to current namespace)
   */
  addResources(resources: Record<string, any>, lang?: string, namespace?: string): void {
    const targetLang = lang || this.currentLanguage;
    const targetNs = namespace || this.currentNamespace;
    
    this.resourceManager.addResources(targetLang, targetNs, resources);
    
    // 触发资源添加事件 (Emit resources added event)
    this.emit(I18nEventType.RESOURCES_ADDED, { 
      language: targetLang, 
      namespace: targetNs,
      resources,
    });
  }

  /**
   * 格式化日期 (Format date)
   * @param date 日期对象 (Date object)
   * @param options 格式化选项 (Formatting options)
   * @returns 格式化后的日期字符串 (Formatted date string)
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return this.dateFormatter.format(date, options);
  }

  /**
   * 格式化数字 (Format number)
   * @param num 数字 (Number)
   * @param options 格式化选项 (Formatting options)
   * @returns 格式化后的数字字符串 (Formatted number string)
   */
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return this.numberFormatter.format(num, options);
  }

  /**
   * 格式化货币 (Format currency)
   * @param amount 金额 (Amount)
   * @param currency 货币代码 (Currency code)
   * @param options 格式化选项 (Formatting options)
   * @returns 格式化后的货币字符串 (Formatted currency string)
   */
  formatCurrency(amount: number, currency: string, options?: Intl.NumberFormatOptions): string {
    return this.numberFormatter.formatCurrency(amount, currency, options);
  }

  /**
   * 格式化相对时间 (Format relative time)
   * @param value 数值 (Value)
   * @param unit 时间单位 (Time unit)
   * @returns 格式化后的相对时间字符串 (Formatted relative time string)
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return this.dateFormatter.formatRelativeTime(value, unit);
  }

  /**
   * 获取缺失的翻译键 (Get missing translation keys)
   * @returns 缺失键数组 (Array of missing keys)
   */
  getMissingKeys(): string[] {
    return Array.from(this.missingKeys);
  }

  /**
   * 获取未使用的翻译键 (Get unused translation keys)
   * @returns 未使用键数组 (Array of unused keys)
   */
  getUnusedKeys(): string[] {
    const allKeys = this.resourceManager.getAllKeys();
    const usedKeys = Array.from(this.usedKeys);
    
    return allKeys.filter(key => !usedKeys.includes(key));
  }

  /**
   * 生成翻译报告 (Generate translation report)
   * @returns 翻译报告 (Translation report)
   */
  generateReport(): TranslationReport {
    const allKeys = this.resourceManager.getAllKeys();
    const missingKeys = this.getMissingKeys();
    const unusedKeys = this.getUnusedKeys();
    
    // 计算每种语言的统计信息 (Calculate statistics for each language)
    const languageStats: Record<string, {
      totalKeys: number;
      missingKeys: number;
      completionRate: number;
    }> = {};
    
    for (const lang of this.config.languages) {
      const langKeys = this.resourceManager.getKeysForLanguage(lang);
      const totalKeys = allKeys.length;
      const missingCount = totalKeys - langKeys.length;
      
      languageStats[lang] = {
        totalKeys,
        missingKeys: missingCount,
        completionRate: totalKeys > 0 ? (langKeys.length / totalKeys) : 1,
      };
    }
    
    // 计算每个命名空间的统计信息 (Calculate statistics for each namespace)
    const namespaceStats: Record<string, {
      totalKeys: number;
      keysByLanguage: Record<string, number>;
    }> = {};
    
    const namespaces = this.resourceManager.getAllNamespaces();
    for (const ns of namespaces) {
      const keysByLanguage: Record<string, number> = {};
      
      for (const lang of this.config.languages) {
        keysByLanguage[lang] = this.resourceManager.getKeysForNamespace(lang, ns).length;
      }
      
      namespaceStats[ns] = {
        totalKeys: this.resourceManager.getKeysForNamespace(this.currentLanguage, ns).length,
        keysByLanguage,
      };
    }
    
    // 格式化缺失键和未使用键的问题列表 (Format issue lists for missing and unused keys)
    const missingKeyIssues = missingKeys.map(key => {
      const ns = key.indexOf(':') > -1 ? key.split(':')[0] : this.currentNamespace;
      const missingIn = this.config.languages.filter(lang => 
        !this.resourceManager.hasTranslation(lang, ns, key),
      );
      
      return {
        key,
        namespace: ns,
        languages: missingIn,
      };
    });
    
    const unusedKeyIssues = unusedKeys.map(key => {
      const ns = key.indexOf(':') > -1 ? key.split(':')[0] : this.currentNamespace;
      const existsIn = this.config.languages.filter(lang => 
        this.resourceManager.hasTranslation(lang, ns, key),
      );
      
      return {
        key,
        namespace: ns,
        languages: existsIn,
      };
    });
    
    // 创建并返回报告 (Create and return report)
    return {
      project: {
        name: 'i18n-maestro',
        version: '0.1.0', // 应从包信息获取 (Should be obtained from package info)
      },
      languages: languageStats,
      namespaces: namespaceStats,
      issues: {
        missingKeys: missingKeyIssues,
        unusedKeys: unusedKeyIssues,
      },
      generatedAt: new Date(),
    };
  }

  /**
   * 检查翻译键是否存在 (Check if a translation key exists)
   * @param key 翻译键 (Translation key)
   * @param options 选项 (Options)
   * @returns 是否存在 (Whether the key exists)
   */
  exists(key: string, options: ExistsOptions = {}): boolean {
    const namespace = options.ns || this.currentNamespace;
    
    // 检查当前语言 (Check current language)
    const exists = this.resourceManager.hasTranslation(
      this.currentLanguage, 
      namespace, 
      key,
    );
    
    // 如果在当前语言中没有找到且设置了检查回退选项，则检查回退语言
    // (If not found in current language and check fallback option is set, check fallback language)
    if (!exists && options.checkFallback && this.config.fallbackLanguage) {
      return this.resourceManager.hasTranslation(
        this.config.fallbackLanguage, 
        namespace, 
        key,
      );
    }
    
    return exists;
  }

  /**
   * 改变当前命名空间 (Change current namespace)
   * @param namespace 命名空间 (Namespace)
   */
  changeNamespace(namespace: string): void {
    this.currentNamespace = namespace;
  }

  /**
   * 注册插件 (Register plugin)
   * @param plugin 插件对象 (Plugin object)
   */
  registerPlugin(plugin: I18nPlugin): void {
    // 检查是否已注册相同名称的插件 (Check if a plugin with the same name is already registered)
    const existingPlugin = this.plugins.find(p => p.name === plugin.name);
    if (existingPlugin) {
      console.warn(`Plugin with name "${plugin.name}" is already registered. It will be replaced.`);
      this.plugins = this.plugins.filter(p => p.name !== plugin.name);
    }
    
    // 添加并初始化插件 (Add and initialize plugin)
    this.plugins.push(plugin);
    plugin.init(this);
  }

  /**
   * 添加事件监听器 (Add event listener)
   * @param type 事件类型 (Event type)
   * @param listener 监听器函数 (Listener function)
   */
  on(type: I18nEventType, listener: (event: I18nEvent) => void): void {
    this.eventManager.on(type, listener);
  }

  /**
   * 移除事件监听器 (Remove event listener)
   * @param type 事件类型 (Event type)
   * @param listener 监听器函数 (Listener function)
   */
  off(type: I18nEventType, listener: (event: I18nEvent) => void): void {
    this.eventManager.off(type, listener);
  }

  /**
   * 触发事件 (Emit event)
   * @param type 事件类型 (Event type)
   * @param payload 事件数据 (Event data)
   */
  emit(type: I18nEventType, payload: any): void {
    this.eventManager.emit(type, payload);
  }

  /**
   * 获取资源存储 (Get resource store)
   * @returns 资源存储对象 (Resource store object)
   */
  getResourceStore(): Record<string, Record<string, Record<string, any>>> {
    return this.resourceManager.getStore();
  }
}