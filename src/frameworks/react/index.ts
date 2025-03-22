/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 注意：这是一个框架集成的基础实现，在实际项目中需要完整的React依赖
// (Note: This is a basic implementation of framework integration, in real projects you need complete React dependencies)

import type { I18nInstance, TranslateOptions, TranslateFunction } from '../../types/index';

/**
 * React I18n上下文类型 (React I18n context type)
 */
interface I18nContextValue {
  /**
   * I18n实例 (I18n instance)
   */
  i18n: I18nInstance;
  
  /**
   * 当前语言 (Current language)
   */
  language: string;
  
  /**
   * 支持的语言列表 (Supported languages list)
   */
  supportedLanguages: string[];
  
  /**
   * 切换语言函数 (Function to change language)
   */
  changeLanguage: (lang: string) => void;
  
  /**
   * 翻译函数 (Translation function)
   */
  t: TranslateFunction;
  
  /**
   * 默认命名空间 (Default namespace)
   */
  defaultNamespace?: string;
}

// 模拟React Context创建 (Simulate React Context creation)
// 在测试环境中，这只是一个占位符 (In test environment, this is just a placeholder)
function createMockContext<T>(defaultValue: T) {
  let contextValue = defaultValue;
  return {
    Provider: function Provider(props: { value: T; children: unknown }) {
      contextValue = props.value;
      return props.children;
    },
    Consumer: function Consumer(props: { children: (value: T) => unknown }) {
      return props.children(contextValue);
    },
    _getValue: () => contextValue, // 用于测试 (For testing purposes)
  };
}

/**
 * 创建React I18n上下文 (Create React I18n context)
 */
const I18nContext = createMockContext<I18nContextValue | null>(null);

/**
 * I18n提供者属性 (I18n provider props)
 */
export interface I18nProviderProps {
  /**
   * I18n实例 (I18n instance)
   */
  i18n: I18nInstance;
  
  /**
   * 默认命名空间 (Default namespace)
   */
  defaultNamespace?: string;
  
  /**
   * 子元素 (Children)
   */
  children: unknown;
}

/**
 * I18n上下文提供者组件 (I18n context provider component)
 */
export function I18nProvider({ 
  i18n, 
  defaultNamespace, 
  children,
}: I18nProviderProps) {
  // 在实际实现中，这里应该使用React的useState和useEffect
  // (In real implementation, this should use React's useState and useEffect)
  const language = i18n.getLanguage();
  const supportedLanguages: string[] = [];
  
  // 切换语言函数 (Function to change language)
  const changeLanguage = (lang: string) => {
    i18n.setLanguage(lang);
  };
  
  // 包装翻译函数以处理默认命名空间 (Wrap translation function to handle default namespace)
  const t = (key: string, options?: TranslateOptions) => {
    return i18n.t(key, {
      ns: defaultNamespace,
      ...options,
    });
  };
  
  // 创建上下文值 (Create context value)
  const contextValue: I18nContextValue = {
    i18n,
    language,
    supportedLanguages,
    changeLanguage,
    t,
    defaultNamespace,
  };
  
  // 在测试实现中，直接返回子元素 (In test implementation, just return children)
  return I18nContext.Provider({ value: contextValue, children });
}

/**
 * useTranslation钩子返回值接口 (useTranslation hook return value interface)
 */
export interface UseTranslationReturn {
  /**
   * 翻译函数 (Translation function)
   */
  t: TranslateFunction;
  
  /**
   * I18n实例 (I18n instance)
   */
  i18n: I18nInstance;
  
  /**
   * 当前语言 (Current language)
   */
  language: string;
  
  /**
   * 切换语言函数 (Function to change language)
   */
  changeLanguage: (lang: string) => void;
  
  /**
   * 支持的语言列表 (Supported languages list)
   */
  supportedLanguages: string[];
}

/**
 * 使用翻译钩子 (Use translation hook)
 * @param namespace 可选的命名空间 (Optional namespace)
 * @returns 翻译相关的对象和方法 (Translation-related objects and methods)
 */
export function useTranslation(namespace?: string): UseTranslationReturn {
  // 在测试实现中，直接使用I18nContext的内部值
  // (In test implementation, directly use the internal value of I18nContext)
  const context = I18nContext._getValue();
  
  if (!context) {
    throw new Error(
      '没有找到I18n上下文。请确保在使用useTranslation()的组件被I18nProvider包裹。',
    );
  }
  
  const { i18n, language, supportedLanguages, changeLanguage } = context;
  
  // 使用命名空间优先级：参数 > 上下文默认值 (Namespace priority: param > context default)
  const ns = namespace || context.defaultNamespace;
  
  // 带命名空间的翻译函数 (Translation function with namespace)
  const t = (key: string, options?: TranslateOptions) => {
    return i18n.t(key, {
      ns,
      ...options,
    });
  };
  
  return {
    t,
    i18n,
    language,
    changeLanguage,
    supportedLanguages,
  };
}

/**
 * Trans组件属性 (Trans component props)
 */
export interface TransProps {
  /**
   * 翻译键 (Translation key)
   */
  i18nKey: string;
  
  /**
   * 命名空间 (Namespace)
   */
  ns?: string;
  
  /**
   * 可选的插值变量 (Optional interpolation variables)
   */
  values?: Record<string, unknown>;
  
  /**
   * 指定显示HTML元素或组件 (Specify HTML element or component to display)
   * @default 'span'
   */
  component?: string | { (props: Record<string, unknown>): unknown };
  
  /**
   * 传递给组件的其他属性 (Other props passed to the component)
   */
  [key: string]: unknown;
}

/**
 * 允许在翻译中使用HTML的Trans组件 (Trans component for using HTML in translations)
 */
export function Trans({
  i18nKey,
  ns,
  values = {},
  component = 'span',
  ...rest
}: TransProps) {
  // 使用翻译钩子 (Use translation hook)
  const { t } = useTranslation(ns);
  
  // 翻译结果 (Translation result)
  const translatedContent = t(i18nKey, values);
  
  // 在测试实现中，直接返回翻译后的内容 (In test implementation, just return translated content)
  return { 
    type: component, 
    props: { ...rest, dangerouslySetInnerHTML: { __html: translatedContent } },
    content: translatedContent,
  };
}

/**
 * 初始化React I18n (Initialize React I18n)
 * @param _i18n I18n实例 (I18n instance)
 * @returns 包含React集成的对象 (Object containing React integration)
 */
export function initReactI18n(_i18n: I18nInstance) {
  return {
    I18nProvider,
    useTranslation,
    Trans,
  };
}

export default {
  Provider: I18nProvider,
  useTranslation,
  Trans,
  initReactI18n,
};