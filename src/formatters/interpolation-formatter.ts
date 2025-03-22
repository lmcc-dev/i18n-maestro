/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Formatter } from '../types';
import { TranslationUtils } from '../utils/translation-utils';

/**
 * 插值选项接口 (Interpolation options interface)
 */
interface InterpolationOptions {
  // 前缀 (Prefix)
  prefix?: string;
  // 后缀 (Suffix)
  suffix?: string;
  // 是否转义值 (Whether to escape values)
  escapeValue?: boolean;
}

/**
 * 插值格式化器类，提供插值功能 (Interpolation formatter class, provides interpolation functionality)
 */
export class InterpolationFormatter implements Formatter<string> {
  private prefix: string;
  private suffix: string;
  private escapeValue: boolean;

  /**
   * 构造函数 (Constructor)
   * @param options 插值选项 (Interpolation options)
   */
  constructor(options: InterpolationOptions = {}) {
    this.prefix = options.prefix || '{';
    this.suffix = options.suffix || '}';
    this.escapeValue = options.escapeValue !== false;
  }

  /**
   * 设置选项 (Set options)
   * @param options 插值选项 (Interpolation options)
   */
  setOptions(options: InterpolationOptions): void {
    if (options.prefix !== undefined) {
      this.prefix = options.prefix;
    }
    
    if (options.suffix !== undefined) {
      this.suffix = options.suffix;
    }
    
    if (options.escapeValue !== undefined) {
      this.escapeValue = options.escapeValue;
    }
  }

  /**
   * 格式化模板字符串，替换插值变量 (Format template string, replace interpolated variables)
   * @param template 模板字符串 (Template string)
   * @param values 变量值对象 (Variable values object)
   * @returns 格式化后的字符串 (Formatted string)
   */
  format(template: string, values: Record<string, any> = {}): string {
    if (!template || typeof template !== 'string') {
      return '';
    }
    
    // 如果没有提供变量值，直接返回模板 (If no variable values are provided, return template directly)
    if (!values || typeof values !== 'object') {
      return template;
    }
    
    // 检查是否需要覆盖默认的转义设置 (Check if default escape setting needs to be overridden)
    let escapeValue = this.escapeValue;
    if (values.interpolation && values.interpolation.escapeValue !== undefined) {
      escapeValue = values.interpolation.escapeValue;
    }
    
    // 准备要替换的变量 (Prepare variables to replace)
    const replacements: Record<string, any> = {};
    for (const key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key) && key !== 'interpolation') {
        const value = values[key];
        
        // 如果值不是对象或数组，才进行替换 (Only replace if value is not an object or array)
        if (value === null || 
            value === undefined || 
            typeof value !== 'object' || 
            Array.isArray(value)) {
          
          // 转义HTML特殊字符（如果需要） (Escape HTML special characters if needed)
          const processedValue = escapeValue && typeof value === 'string' 
            ? TranslationUtils.escapeHtml(value)
            : String(value);
          
          replacements[key] = processedValue;
        }
      }
    }
    
    // 执行模板替换 (Perform template replacement)
    return TranslationUtils.formatTemplate(template, replacements, this.prefix, this.suffix);
  }

  /**
   * 嵌套格式化处理，处理更复杂的模板情况 (Nested format processing, handles more complex template scenarios)
   * @param template 模板字符串 (Template string)
   * @param values 变量值对象 (Variable values object)
   * @param maxDepth 最大嵌套深度，防止循环引用 (Maximum nesting depth, prevents circular references)
   * @returns 格式化后的字符串 (Formatted string)
   */
  formatNested(template: string, values: Record<string, any> = {}, maxDepth: number = 5): string {
    // 基本格式化 (Basic formatting)
    let result = this.format(template, values);
    
    // 如果仍有未替换的变量占位符且嵌套深度未达上限，继续处理
    // (If there are still unreplaced variable placeholders and nesting depth has not reached the limit, continue processing)
    if (maxDepth > 0 && result.includes(this.prefix) && result.includes(this.suffix)) {
      result = this.formatNested(result, values, maxDepth - 1);
    }
    
    return result;
  }

  /**
   * 高级格式化处理，处理条件、复数等情况 (Advanced format processing, handles conditions, plurals, etc.)
   * @param template 模板字符串 (Template string)
   * @param values 变量值对象 (Variable values object)
   * @returns 格式化后的字符串 (Formatted string)
   */
  formatAdvanced(template: string, values: Record<string, any> = {}): string {
    // 这是一个简化版，完整实现需要支持条件语法、复数规则等
    // (This is a simplified version, full implementation needs to support conditional syntax, plural rules, etc.)
    
    // 基本格式化 (Basic formatting)
    const result = this.format(template, values);
    
    // TODO: 实现条件处理、复数处理等高级功能
    // (TODO: Implement advanced features like conditional processing, plural processing, etc.)
    
    return result;
  }
}