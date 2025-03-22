/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Formatter } from '../types';

/**
 * 数字格式化器类，提供数字格式化功能 (Number formatter class, provides number formatting functionality)
 */
export class NumberFormatter implements Formatter<number> {
  private formatter: Intl.NumberFormat;
  private locale: string;
  private defaultOptions: Intl.NumberFormatOptions;

  /**
   * 构造函数 (Constructor)
   * @param locale 地区代码，例如 'zh-CN' (Locale code, e.g. 'zh-CN')
   * @param defaultOptions 默认格式化选项 (Default formatting options)
   */
  constructor(locale: string, defaultOptions: Intl.NumberFormatOptions = {}) {
    this.locale = locale;
    this.defaultOptions = defaultOptions;
    
    // 创建格式化器实例 (Create formatter instance)
    this.formatter = new Intl.NumberFormat(locale, defaultOptions);
  }

  /**
   * 设置地区 (Set locale)
   * @param locale 地区代码 (Locale code)
   */
  setLocale(locale: string): void {
    this.locale = locale;
    
    // 更新格式化器实例 (Update formatter instance)
    this.formatter = new Intl.NumberFormat(locale, this.defaultOptions);
  }

  /**
   * 格式化数字 (Format number)
   * @param num 数字 (Number)
   * @param options 格式化选项，将与默认选项合并 (Formatting options, will be merged with default options)
   * @returns 格式化后的数字字符串 (Formatted number string)
   */
  format(num: number, options?: Intl.NumberFormatOptions): string {
    if (typeof num !== 'number' || isNaN(num)) {
      throw new Error('格式化的值必须是数字');
    }
    
    // 如果提供了选项，创建新的格式化器 (If options are provided, create a new formatter)
    if (options) {
      const mergedOptions = { ...this.defaultOptions, ...options };
      const formatter = new Intl.NumberFormat(this.locale, mergedOptions);
      try {
        return formatter.format(num);
      } catch {
        return num.toString();
      }
    }
    
    // 否则使用默认格式化器 (Otherwise use default formatter)
    return this.formatter.format(num);
  }

  /**
   * 格式化货币 (Format currency)
   * @param amount 金额 (Amount)
   * @param currency 货币代码，例如 'CNY', 'USD' (Currency code, e.g. 'CNY', 'USD')
   * @param options 格式化选项 (Formatting options)
   * @returns 格式化后的货币字符串 (Formatted currency string)
   */
  formatCurrency(amount: number, currency: string, options?: Intl.NumberFormatOptions): string {
    // 合并选项，设置style为currency并指定货币代码
    // (Merge options, set style to currency and specify currency code)
    const currencyOptions: Intl.NumberFormatOptions = {
      ...this.defaultOptions,
      ...options,
      style: 'currency',
      currency,
    };
    
    // 创建货币格式化器 (Create currency formatter)
    const formatter = new Intl.NumberFormat(this.locale, currencyOptions);
    try {
      return formatter.format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  /**
   * 格式化百分比 (Format percentage)
   * @param value 数值，范围通常为0-1 (Value, typically in range 0-1)
   * @param options 格式化选项 (Formatting options)
   * @returns 格式化后的百分比字符串 (Formatted percentage string)
   */
  formatPercent(value: number, options?: Intl.NumberFormatOptions): string {
    // 合并选项，设置style为percent (Merge options, set style to percent)
    const percentOptions: Intl.NumberFormatOptions = {
      ...this.defaultOptions,
      ...options,
      style: 'percent',
    };
    
    // 创建百分比格式化器 (Create percentage formatter)
    const formatter = new Intl.NumberFormat(this.locale, percentOptions);
    return formatter.format(value);
  }

  /**
   * 格式化带单位的数字 (Format number with unit)
   * @param value 数值 (Value)
   * @param unit 单位，例如 'meter', 'liter' (Unit, e.g. 'meter', 'liter')
   * @param options 格式化选项 (Formatting options)
   * @returns 格式化后的带单位数字字符串 (Formatted number with unit string)
   */
  formatUnit(value: number, unit: string, options?: Intl.NumberFormatOptions): string {
    // 合并选项，设置style为unit并指定单位
    // (Merge options, set style to unit and specify unit)
    const unitOptions: Intl.NumberFormatOptions = {
      ...this.defaultOptions,
      ...options,
      style: 'unit',
      unit,
    };
    
    // 创建单位格式化器 (Create unit formatter)
    const formatter = new Intl.NumberFormat(this.locale, unitOptions);
    return formatter.format(value);
  }

  /**
   * 使用预设格式格式化数字 (Format number using preset format)
   * @param num 数字 (Number)
   * @param preset 预设格式： (Preset format:)
   *   - 'decimal': 十进制数，如 '1,234.56' (Decimal number, e.g. '1,234.56')
   *   - 'integer': 整数，如 '1,235' (Integer, e.g. '1,235')
   *   - 'percent': 百分比，如 '12.35%' (Percentage, e.g. '12.35%')
   *   - 'currency': 货币，需要额外指定货币代码 (Currency, requires additional currency code)
   *   - 'compact': 简洁格式，如 '1.2K', '2M' (Compact format, e.g. '1.2K', '2M')
   *   - 'scientific': 科学计数法，如 '1.235E3' (Scientific notation, e.g. '1.235E3')
   *   - 'engineering': 工程计数法，如 '1.235E3' (Engineering notation, e.g. '1.235E3')
   * @param options 附加选项，如货币代码等 (Additional options, e.g. currency code)
   * @returns 格式化后的数字字符串 (Formatted number string)
   */
  formatPreset(num: number, preset: string, options: Record<string, any> = {}): string {
    let formatOptions: Intl.NumberFormatOptions = {};
    
    switch (preset) {
      case 'decimal':
        formatOptions = { 
          style: 'decimal',
          useGrouping: true,
          minimumFractionDigits: options.fractionDigits || 0,
          maximumFractionDigits: options.fractionDigits || 2,
        };
        break;
      case 'integer':
        formatOptions = { 
          style: 'decimal',
          useGrouping: true,
          maximumFractionDigits: 0,
        };
        break;
      case 'percent':
        formatOptions = { 
          style: 'percent',
          minimumFractionDigits: options.fractionDigits || 0,
          maximumFractionDigits: options.fractionDigits || 2,
        };
        break;
      case 'currency':
        if (!options.currency) {
          throw new Error('使用currency预设时必须指定currency选项');
        }
        return this.formatCurrency(num, options.currency, {
          minimumFractionDigits: options.fractionDigits || 2,
          maximumFractionDigits: options.fractionDigits || 2,
        });
      case 'compact':
        formatOptions = { 
          notation: 'compact',
          compactDisplay: options.display || 'short',
        };
        break;
      case 'scientific':
        formatOptions = { notation: 'scientific' };
        break;
      case 'engineering':
        formatOptions = { notation: 'engineering' };
        break;
      default:
        throw new Error(`未知的预设格式: ${preset}`);
    }
    
    return this.format(num, formatOptions);
  }

  /**
   * 解析数字字符串为数值 (Parse number string to value)
   * @param str 数字字符串 (Number string)
   * @returns 解析后的数值 (Parsed value)
   */
  parse(str: string): number {
    // 使用locale-sensitive的方式解析，处理不同地区的数字表示方式
    // (Parse in a locale-sensitive way, handling different regional number representations)
    try {
      // 移除非数字字符，但保留小数点和负号
      // (Remove non-numeric characters, but keep decimal point and minus sign)
      // 注意：这是简化方法，完整实现需要考虑不同地区的小数点、千位分隔符等
      // (Note: This is a simplified method, full implementation needs to consider 
      // decimal points, thousand separators etc. for different regions)
      const cleanStr = str.replace(/[^0-9.-]/g, '');
      return Number(cleanStr);
    } catch {
      throw new Error(`无法解析数字字符串: ${str}`);
    }
  }
}