/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Formatter } from '../types';

/**
 * 日期格式化器类，提供日期格式化功能 (Date formatter class, provides date formatting functionality)
 */
export class DateFormatter implements Formatter<Date> {
  private formatter: Intl.DateTimeFormat;
  private relativeFormatter: Intl.RelativeTimeFormat;
  private locale: string;
  private defaultOptions: Intl.DateTimeFormatOptions;

  /**
   * 构造函数 (Constructor)
   * @param locale 地区代码，例如 'zh-CN' (Locale code, e.g. 'zh-CN')
   * @param defaultOptions 默认格式化选项 (Default formatting options)
   */
  constructor(locale: string, defaultOptions: Intl.DateTimeFormatOptions = {}) {
    this.locale = locale;
    this.defaultOptions = defaultOptions;
    
    // 创建格式化器实例 (Create formatter instances)
    this.formatter = new Intl.DateTimeFormat(locale, defaultOptions);
    this.relativeFormatter = new Intl.RelativeTimeFormat(locale, { 
      numeric: 'auto',
      style: 'long',
    });
  }

  /**
   * 设置地区 (Set locale)
   * @param locale 地区代码 (Locale code)
   */
  setLocale(locale: string): void {
    this.locale = locale;
    
    // 更新格式化器实例 (Update formatter instances)
    this.formatter = new Intl.DateTimeFormat(locale, this.defaultOptions);
    this.relativeFormatter = new Intl.RelativeTimeFormat(locale, { 
      numeric: 'auto',
      style: 'long',
    });
  }

  /**
   * 格式化日期 (Format date)
   * @param date 日期对象 (Date object)
   * @param options 格式化选项，将与默认选项合并 (Formatting options, will be merged with default options)
   * @returns 格式化后的日期字符串 (Formatted date string)
   */
  format(date: Date, options?: Intl.DateTimeFormatOptions): string {
    if (!(date instanceof Date)) {
      throw new Error('格式化的值必须是 Date 对象');
    }
    
    // 如果提供了选项，创建新的格式化器 (If options are provided, create a new formatter)
    if (options) {
      const mergedOptions = { ...this.defaultOptions, ...options };
      const formatter = new Intl.DateTimeFormat(this.locale, mergedOptions);
      return formatter.format(date);
    }
    
    // 否则使用默认格式化器 (Otherwise use default formatter)
    return this.formatter.format(date);
  }

  /**
   * 格式化相对时间 (Format relative time)
   * @param value 数值 (Value)
   * @param unit 时间单位 (Time unit)
   * @param options 格式化选项 (Formatting options)
   * @returns 格式化后的相对时间字符串 (Formatted relative time string)
   */
  formatRelativeTime(
    value: number, 
    unit: Intl.RelativeTimeFormatUnit, 
    options?: Intl.RelativeTimeFormatOptions,
  ): string {
    // 如果提供了选项，创建新的格式化器 (If options are provided, create a new formatter)
    if (options) {
      const formatter = new Intl.RelativeTimeFormat(this.locale, options);
      return formatter.format(value, unit);
    }
    
    // 否则使用默认格式化器 (Otherwise use default formatter)
    return this.relativeFormatter.format(value, unit);
  }

  /**
   * 计算日期之间的相对时间 (Calculate relative time between dates)
   * @param date 目标日期 (Target date)
   * @param baseDate 基准日期，默认为当前时间 (Base date, defaults to current time)
   * @returns 相对时间对象，包含值和单位 (Relative time object, includes value and unit)
   */
  calculateRelativeTime(date: Date, baseDate: Date = new Date()): { 
    value: number; 
    unit: Intl.RelativeTimeFormatUnit;
  } {
    const diffMs = date.getTime() - baseDate.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    const diffWeek = Math.round(diffDay / 7);
    const diffMonth = Math.round(diffDay / 30);
    const diffYear = Math.round(diffDay / 365);
    
    // 根据差值大小选择合适的单位 (Choose appropriate unit based on difference size)
    if (Math.abs(diffSec) < 60) {
      return { value: diffSec, unit: 'second' };
    } else if (Math.abs(diffMin) < 60) {
      return { value: diffMin, unit: 'minute' };
    } else if (Math.abs(diffHour) < 24) {
      return { value: diffHour, unit: 'hour' };
    } else if (Math.abs(diffDay) < 7) {
      return { value: diffDay, unit: 'day' };
    } else if (Math.abs(diffWeek) < 4) {
      return { value: diffWeek, unit: 'week' };
    } else if (Math.abs(diffMonth) < 12) {
      return { value: diffMonth, unit: 'month' };
    } else {
      return { value: diffYear, unit: 'year' };
    }
  }

  /**
   * 格式化一对日期之间的相对时间 (Format relative time between a pair of dates)
   * @param date 目标日期 (Target date)
   * @param baseDate 基准日期，默认为当前时间 (Base date, defaults to current time)
   * @param options 格式化选项 (Formatting options)
   * @returns 格式化后的相对时间字符串 (Formatted relative time string)
   */
  formatDateRelativeToNow(
    date: Date, 
    baseDate: Date = new Date(), 
    options?: Intl.RelativeTimeFormatOptions,
  ): string {
    const { value, unit } = this.calculateRelativeTime(date, baseDate);
    return this.formatRelativeTime(value, unit, options);
  }

  /**
   * 使用预设格式格式化日期 (Format date using preset format)
   * @param date 日期对象 (Date object)
   * @param preset 预设格式： (Preset format:)
   *   - 'short': 简短日期，如 '10/3/2023' (Short date, e.g. '10/3/2023')
   *   - 'medium': 中等日期，如 'Oct 3, 2023' (Medium date, e.g. 'Oct 3, 2023')
   *   - 'long': 长日期，如 'October 3, 2023' (Long date, e.g. 'October 3, 2023')
   *   - 'full': 完整日期，如 'Tuesday, October 3, 2023' (Full date, e.g. 'Tuesday, October 3, 2023')
   *   - 'shortTime': 简短时间，如 '14:30' (Short time, e.g. '14:30')
   *   - 'mediumTime': 中等时间，如 '2:30 PM' (Medium time, e.g. '2:30 PM')
   *   - 'longTime': 长时间，如 '2:30:00 PM' (Long time, e.g. '2:30:00 PM')
   *   - 'shortDateTime': 简短日期和时间 (Short date and time)
   *   - 'mediumDateTime': 中等日期和时间 (Medium date and time)
   *   - 'longDateTime': 长日期和时间 (Long date and time)
   * @returns 格式化后的日期字符串 (Formatted date string)
   */
  formatPreset(date: Date, preset: string): string {
    let options: Intl.DateTimeFormatOptions = {};
    
    switch (preset) {
      case 'short':
        options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        break;
      case 'medium':
        options = { year: 'numeric', month: 'short', day: 'numeric' };
        break;
      case 'long':
        options = { year: 'numeric', month: 'long', day: 'numeric' };
        break;
      case 'full':
        options = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
        };
        break;
      case 'shortTime':
        options = { hour: 'numeric', minute: 'numeric' };
        break;
      case 'mediumTime':
        options = { hour: 'numeric', minute: 'numeric', hour12: true };
        break;
      case 'longTime':
        options = { 
          hour: 'numeric', 
          minute: 'numeric', 
          second: 'numeric', 
          hour12: true, 
        };
        break;
      case 'shortDateTime':
        options = { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric',
          hour: 'numeric', 
          minute: 'numeric',
        };
        break;
      case 'mediumDateTime':
        options = { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric', 
          minute: 'numeric', 
          hour12: true, 
        };
        break;
      case 'longDateTime':
        options = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: 'numeric', 
          minute: 'numeric', 
          second: 'numeric', 
          hour12: true, 
        };
        break;
      default:
        throw new Error(`未知的预设格式: ${preset}`);
    }
    
    return this.format(date, options);
  }
}