/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { I18nConfig } from '../types';

/**
 * 配置验证器类，验证I18n配置的有效性 (Config validator class, validates the validity of I18n configuration)
 */
export class ConfigValidator {
  /**
   * 验证配置对象 (Validate configuration object)
   * @param config I18n配置对象 (I18n configuration object)
   * @throws 如果配置无效则抛出错误 (Throws error if configuration is invalid)
   */
  static validate(config: I18nConfig): void {
    // 验证必需字段 (Validate required fields)
    this.validateRequiredFields(config);
    
    // 验证语言设置 (Validate language settings)
    this.validateLanguageSettings(config);
    
    // 验证资源设置 (Validate resource settings)
    this.validateResourceSettings(config);
    
    // 验证插件设置 (Validate plugin settings)
    this.validatePluginSettings(config);
    
    // 验证格式化设置 (Validate formatting settings)
    this.validateFormattingSettings(config);
  }

  /**
   * 验证必需字段 (Validate required fields)
   * @param config I18n配置对象 (I18n configuration object)
   * @throws 如果缺少必需字段则抛出错误 (Throws error if required fields are missing)
   */
  private static validateRequiredFields(config: I18nConfig): void {
    // 检查配置对象是否存在 (Check if configuration object exists)
    if (!config) {
      throw new Error('配置对象不能为空');
    }
    
    // 检查默认语言 (Check default language)
    if (!config.defaultLanguage) {
      throw new Error('配置必须指定默认语言 (defaultLanguage)');
    }
    
    // 检查语言列表 (Check languages list)
    if (!config.languages || !Array.isArray(config.languages) || config.languages.length === 0) {
      throw new Error('配置必须包含至少一种语言 (languages)');
    }
  }

  /**
   * 验证语言设置 (Validate language settings)
   * @param config I18n配置对象 (I18n configuration object)
   * @throws 如果语言设置无效则抛出错误 (Throws error if language settings are invalid)
   */
  private static validateLanguageSettings(config: I18nConfig): void {
    // 检查默认语言是否在语言列表中 (Check if default language is in languages list)
    if (!config.languages.includes(config.defaultLanguage)) {
      throw new Error(`默认语言 ${config.defaultLanguage} 不在支持的语言列表中`);
    }
    
    // 如果设置了回退语言，检查它是否在语言列表中
    // (If fallback language is set, check if it's in languages list)
    if (config.fallbackLanguage && !config.languages.includes(config.fallbackLanguage)) {
      throw new Error(`回退语言 ${config.fallbackLanguage} 不在支持的语言列表中`);
    }
    
    // 检查语言代码格式 (Check language code format)
    for (const lang of config.languages) {
      if (typeof lang !== 'string' || lang.trim() === '') {
        throw new Error('语言代码必须是非空字符串');
      }
      
      // 可选：添加对语言代码格式的更严格验证，例如是否符合 BCP 47 标准
      // (Optional: add stricter validation of language code format, e.g. BCP 47 compliance)
    }
  }

  /**
   * 验证资源设置 (Validate resource settings)
   * @param config I18n配置对象 (I18n configuration object)
   * @throws 如果资源设置无效则抛出错误 (Throws error if resource settings are invalid)
   */
  private static validateResourceSettings(config: I18nConfig): void {
    // 检查资源设置 (Check resource settings)
    if (config.resources) {
      // 如果resources是字符串，应该是有效的路径
      // (If resources is a string, it should be a valid path)
      if (typeof config.resources === 'string') {
        // 路径验证依赖于运行环境，这里简单检查是否为非空字符串
        // (Path validation depends on runtime environment, here we simply check if it's a non-empty string)
        if (config.resources.trim() === '') {
          throw new Error('资源路径不能为空');
        }
      } 
      // 如果resources是对象，检查其结构
      // (If resources is an object, check its structure)
      else if (typeof config.resources === 'object') {
        // 检查每种语言的资源 (Check resources for each language)
        for (const lang in config.resources) {
          if (Object.prototype.hasOwnProperty.call(config.resources, lang)) {
            // 检查语言是否在支持列表中 (Check if language is in supported list)
            if (!config.languages.includes(lang)) {
              throw new Error(`资源中包含不支持的语言: ${lang}`);
            }
            
            // 检查该语言的资源是否为对象 (Check if resources for the language is an object)
            if (typeof config.resources[lang] !== 'object' || config.resources[lang] === null) {
              throw new Error(`语言 ${lang} 的资源必须是对象`);
            }
          }
        }
      } else {
        throw new Error('resources 必须是字符串（路径）或对象');
      }
    }
    
    // 验证资源选项 (Validate resource options)
    if (config.resourceOptions) {
      // 验证命名空间 (Validate namespaces)
      if (config.resourceOptions.namespaces && 
          (!Array.isArray(config.resourceOptions.namespaces) || 
           config.resourceOptions.namespaces.some(ns => typeof ns !== 'string' || ns.trim() === ''))) {
        throw new Error('命名空间必须是非空字符串数组');
      }
      
      // 验证默认命名空间 (Validate default namespace)
      if (config.resourceOptions.defaultNamespace && 
          typeof config.resourceOptions.defaultNamespace !== 'string') {
        throw new Error('默认命名空间必须是字符串');
      }
      
      // 如果设置了默认命名空间和命名空间列表，检查默认命名空间是否在列表中
      // (If default namespace and namespace list are set, check if default namespace is in the list)
      if (config.resourceOptions.defaultNamespace && 
          config.resourceOptions.namespaces && 
          !config.resourceOptions.namespaces.includes(config.resourceOptions.defaultNamespace)) {
        throw new Error(`默认命名空间 ${config.resourceOptions.defaultNamespace} 不在命名空间列表中`);
      }
      
      // 验证加载策略 (Validate load strategy)
      if (config.resourceOptions.loadStrategy && 
          !['all', 'lazy'].includes(config.resourceOptions.loadStrategy)) {
        throw new Error('加载策略必须是 "all" 或 "lazy"');
      }
    }
  }

  /**
   * 验证插件设置 (Validate plugin settings)
   * @param config I18n配置对象 (I18n configuration object)
   * @throws 如果插件设置无效则抛出错误 (Throws error if plugin settings are invalid)
   */
  private static validatePluginSettings(config: I18nConfig): void {
    // 检查插件列表 (Check plugins list)
    if (config.plugins) {
      if (!Array.isArray(config.plugins)) {
        throw new Error('plugins 必须是数组');
      }
      
      // 检查每个插件 (Check each plugin)
      for (let i = 0; i < config.plugins.length; i++) {
        const plugin = config.plugins[i];
        
        // 检查插件对象 (Check plugin object)
        if (typeof plugin !== 'object' || plugin === null) {
          throw new Error(`插件 #${i+1} 必须是对象`);
        }
        
        // 检查插件名称 (Check plugin name)
        if (!plugin.name || typeof plugin.name !== 'string') {
          throw new Error(`插件 #${i+1} 必须有有效的name属性`);
        }
        
        // 检查插件初始化方法 (Check plugin initialization method)
        if (!plugin.init || typeof plugin.init !== 'function') {
          throw new Error(`插件 "${plugin.name}" 必须有init方法`);
        }
      }
      
      // 检查插件名称是否重复 (Check if plugin names are duplicated)
      const pluginNames = config.plugins.map(p => p.name);
      const uniqueNames = new Set(pluginNames);
      if (uniqueNames.size !== pluginNames.length) {
        throw new Error('插件名称不能重复');
      }
    }
  }

  /**
   * 验证格式化设置 (Validate formatting settings)
   * @param config I18n配置对象 (I18n configuration object)
   * @throws 如果格式化设置无效则抛出错误 (Throws error if formatting settings are invalid)
   */
  private static validateFormattingSettings(config: I18nConfig): void {
    if (config.formatting) {
      // 验证插值选项 (Validate interpolation options)
      if (config.formatting.interpolation) {
        const { prefix, suffix, escapeValue } = config.formatting.interpolation;
        
        // 检查前缀 (Check prefix)
        if (prefix !== undefined && typeof prefix !== 'string') {
          throw new Error('插值前缀必须是字符串');
        }
        
        // 检查后缀 (Check suffix)
        if (suffix !== undefined && typeof suffix !== 'string') {
          throw new Error('插值后缀必须是字符串');
        }
        
        // 检查转义值选项 (Check escape value option)
        if (escapeValue !== undefined && typeof escapeValue !== 'boolean') {
          throw new Error('escapeValue 必须是布尔值');
        }
      }
      
      // 验证日期格式化选项 (Validate date formatting options)
      if (config.formatting.date) {
        this.validateFormattingOption(config.formatting.date, '日期格式化选项');
      }
      
      // 验证数字格式化选项 (Validate number formatting options)
      if (config.formatting.number) {
        this.validateFormattingOption(config.formatting.number, '数字格式化选项');
      }
    }
  }
  
  /**
   * 验证格式化选项 (Validate formatting option)
   * @param option 格式化选项 (Formatting option)
   * @param name 选项名称 (Option name)
   */
  private static validateFormattingOption(option: any, name: string): void {
    // 如果是对象，检查每个语言的设置 (If it's an object, check settings for each language)
    if (typeof option === 'object' && option !== null) {
      // 没有进一步的验证，因为Intl.DateTimeFormatOptions和Intl.NumberFormatOptions的结构很复杂
      // (No further validation because the structure of Intl.DateTimeFormatOptions and Intl.NumberFormatOptions is complex)
      return;
    }
    
    throw new Error(`${name}必须是对象`);
  }
}