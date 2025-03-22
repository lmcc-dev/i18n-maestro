/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 框架适配器入口文件 (Framework adapters entry file)
 * 
 * 该文件导出各种框架的适配器，提供统一的接口进行框架集成
 * (This file exports adapters for various frameworks, providing a unified interface for framework integration)
 */

import { I18nInstance } from '../types/index';

// 导出Vue集成 (Export Vue integration)
import * as VueAdapter from './vue';
export { VueAdapter };

// 导出React集成 (Export React integration)
import * as ReactAdapter from './react';
export { ReactAdapter };

/**
 * 框架类型 (Framework types)
 */
export enum FrameworkType {
  VUE = 'vue',
  REACT = 'react',
  // 未来可能添加 (May add in future):
  // ANGULAR = 'angular',
  // SVELTE = 'svelte'
}

/**
 * 框架集成接口 (Framework integration interface)
 */
export interface FrameworkIntegration {
  /**
   * 初始化框架适配器 (Initialize framework adapter)
   * @param i18n I18n实例 (I18n instance)
   * @param options 框架特定选项 (Framework-specific options)
   * @returns 框架特定的集成对象 (Framework-specific integration object)
   */
  init: (i18n: I18nInstance, options?: any) => any;
}

/**
 * 框架集成映射 (Framework integration mapping)
 */
const frameworkAdapters: Record<FrameworkType, FrameworkIntegration> = {
  [FrameworkType.VUE]: {
    init: (i18n: I18nInstance, options?: VueAdapter.VueI18nOptions) => {
      return VueAdapter.createI18nVue(i18n, options);
    },
  },
  [FrameworkType.REACT]: {
    init: (i18n: I18nInstance) => {
      return ReactAdapter.initReactI18n(i18n);
    },
  },
};

/**
 * 获取特定框架的适配器 (Get adapter for specific framework)
 * @param framework 框架类型 (Framework type)
 * @returns 框架集成接口 (Framework integration interface)
 */
export function getFrameworkAdapter(framework: FrameworkType): FrameworkIntegration {
  const adapter = frameworkAdapters[framework];
  
  if (!adapter) {
    throw new Error(`不支持的框架类型: ${framework}`);
  }
  
  return adapter;
}

export default {
  VueAdapter,
  ReactAdapter,
  FrameworkType,
  getFrameworkAdapter,
};