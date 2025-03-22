/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { I18n } from './core/i18n';
import { I18nConfig, I18nInstance, I18nPlugin } from './types';

/**
 * 创建一个I18n实例 (Create an I18n instance)
 * @param config I18n配置对象 (I18n configuration object)
 * @returns I18n实例 (I18n instance)
 */
export function createI18n(config: I18nConfig): I18nInstance {
  return new I18n(config);
}

// 导出类型和接口 (Export types and interfaces)
export * from './types';

// 导出工具类 (Export utility classes)
export * from './utils/translation-utils';

// 导出格式化器 (Export formatters)
export * from './formatters/date-formatter';
export * from './formatters/number-formatter';
export * from './formatters/interpolation-formatter';

// 导出插件类型 (Export plugin types)
export type { I18nPlugin };