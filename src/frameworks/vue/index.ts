/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import type { I18nInstance, TranslateOptions, TranslateFunction } from '../../types/index';

/**
 * Vue 3 组合式API中的I18n选项 (I18n options for Vue 3 Composition API)
 */
interface VueI18nOptions {
  /**
   * I18n实例 (I18n instance)
   */
  i18n: I18nInstance;
  
  /**
   * 默认命名空间 (Default namespace)
   */
  defaultNamespace?: string;
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
 * 创建Vue I18n插件 (Create Vue I18n plugin)
 * @param options Vue I18n选项 (Vue I18n options)
 * @returns Vue插件对象 (Vue plugin object)
 */
export function createVueI18n(options: VueI18nOptions) {
  const { i18n, defaultNamespace } = options;
  
  /**
   * 创建I18n Vue插件 (Create I18n Vue plugin)
   * @param app Vue应用实例 (Vue application instance)
   */
  function install(app: unknown) {
    // 全局属性 (Global properties)
    (app as any).config.globalProperties.$i18n = i18n;
    (app as any).config.globalProperties.$t = (key: string, options?: TranslateOptions) => {
      return i18n.t(key, {
        ns: defaultNamespace,
        ...options,
      });
    };
    
    // 提供inject依赖 (Provide inject dependencies)
    (app as any).provide('i18n', i18n);
    (app as any).provide('defaultNamespace', defaultNamespace);
  }
  
  return {
    install,
  };
}

/**
 * 使用翻译钩子 (Use translation hook)
 * @param namespace 可选的命名空间 (Optional namespace)
 * @returns 翻译相关的对象和方法 (Translation-related objects and methods)
 */
export function useTranslation(namespace?: string): UseTranslationReturn {
  // 注意：这是一个基础实现，在实际Vue应用中需要使用Vue的inject函数
  // (Note: This is a basic implementation, in real Vue apps you need to use Vue's inject function)
  const i18n = {} as I18nInstance; // 在实际实现中应从inject获取 (Should be obtained from inject in real implementation)
  const defaultNamespace = namespace; // 在实际实现中可以从inject获取默认值 (Can get default from inject in real implementation)
  
  const language = i18n.getLanguage(); 
  const supportedLanguages: string[] = [];
  
  /**
   * 切换语言函数 (Function to change language)
   * @param lang 目标语言 (Target language)
   */
  const changeLanguage = (lang: string): void => {
    i18n.setLanguage(lang);
  };
  
  /**
   * 带命名空间的翻译函数 (Translation function with namespace)
   * @param key 翻译键 (Translation key)
   * @param options 翻译选项 (Translation options)
   * @returns 翻译后的字符串 (Translated string)
   */
  const t = (key: string, options?: TranslateOptions): string => {
    return i18n.t(key, {
      ns: namespace || defaultNamespace,
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
   * 指定标签 (Specify tag)
   * @default 'span'
   */
  tag?: string;
}

/**
 * 创建Trans组件 (Create Trans component)
 * @returns Trans组件定义 (Trans component definition)
 */
export function createTransComponent() {
  return {
    name: 'Trans',
    props: {
      i18nKey: {
        type: String,
        required: true,
      },
      ns: {
        type: String,
        required: false,
        default: undefined,
      },
      values: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      tag: {
        type: String,
        required: false,
        default: 'span',
      },
    },
    setup(props: TransProps) {
      // 使用翻译钩子 (Use translation hook)
      const { t } = useTranslation(props.ns);
      
      /**
       * 渲染函数 (Render function)
       * @returns 渲染后的元素 (Rendered element)
       */
      const render = (): unknown => {
        // 在实际实现中，应使用Vue的h函数创建虚拟DOM
        // (In real implementation, should use Vue's h function to create virtual DOM)
        const translatedContent = t(props.i18nKey, props.values);
        
        // 在测试实现中，直接返回翻译后的内容
        // (In test implementation, just return translated content)
        return {
          tag: props.tag,
          html: translatedContent,
        };
      };
      
      return { render };
    },
  };
}

/**
 * 初始化Vue I18n (Initialize Vue I18n)
 * @param i18n I18n实例 (I18n instance)
 * @param options Vue I18n选项 (Vue I18n options)
 * @returns 包含Vue集成的对象 (Object containing Vue integration)
 */
export function initVueI18n(i18n: I18nInstance, options: { defaultNamespace?: string } = {}) {
  const { defaultNamespace } = options;
  
  // 语言变更监听函数 (Language change listener)
  let _languageChangeListener: (() => void) | null = null;
  
  /**
   * 订阅语言变更 (Subscribe to language changes)
   * @param callback 回调函数 (Callback function)
   */
  const subscribeToLanguageChange = (callback: () => void): void => {
    if (_languageChangeListener) {
      // 这里我们使用类型转换，因为在实际实现中会有这些方法
      // (Here we use type casting because in real implementation these methods will exist)
      (i18n as any).off('languageChanged', _languageChangeListener);
    }
    
    _languageChangeListener = callback;
    // 这里我们使用类型转换，因为在实际实现中会有这些方法
    // (Here we use type casting because in real implementation these methods will exist)
    (i18n as any).on('languageChanged', _languageChangeListener);
  };
  
  /**
   * 取消订阅语言变更 (Unsubscribe from language changes)
   */
  const unsubscribeFromLanguageChange = (): void => {
    if (_languageChangeListener) {
      // 这里我们使用类型转换，因为在实际实现中会有这些方法
      // (Here we use type casting because in real implementation these methods will exist)
      (i18n as any).off('languageChanged', _languageChangeListener);
      _languageChangeListener = null;
    }
  };
  
  // 创建Vue I18n插件 (Create Vue I18n plugin)
  const plugin = createVueI18n({ i18n, defaultNamespace });
  
  // 创建Trans组件 (Create Trans component)
  const Trans = createTransComponent();
  
  return {
    plugin,
    Trans,
    useTranslation,
    subscribeToLanguageChange,
    unsubscribeFromLanguageChange,
  };
}

export default {
  createVueI18n,
  useTranslation,
  createTransComponent,
  initVueI18n,
};