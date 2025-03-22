/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 翻译工具类，提供翻译相关的辅助函数 (Translation utility class, provides helper functions for translation)
 */
export class TranslationUtils {
  /**
   * 根据路径获取对象中的值，支持嵌套路径 (Get value from object by path, supports nested paths)
   * 例如：getValueByPath(obj, 'user.profile.name') (Example: getValueByPath(obj, 'user.profile.name'))
   * 
   * @param obj 目标对象 (Target object)
   * @param path 路径字符串，使用点号分隔 (Path string, separated by dots)
   * @returns 找到的值，未找到则返回undefined (Found value, or undefined if not found)
   */
  static getValueByPath(obj: Record<string, any>, path: string): any {
    // 如果对象为空或路径为空，返回undefined (If object or path is empty, return undefined)
    if (!obj || !path) {
      return undefined;
    }
    
    // 如果是简单路径（不包含点号），直接返回属性值
    // (If it's a simple path (no dots), directly return property value)
    if (path.indexOf('.') === -1) {
      return obj[path];
    }
    
    // 分割路径 (Split path)
    const parts = path.split('.');
    let current = obj;
    
    // 逐级查找 (Find level by level)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // 如果当前级别不存在或不是对象，返回undefined
      // (If current level doesn't exist or is not an object, return undefined)
      if (current === undefined || current === null || typeof current !== 'object') {
        return undefined;
      }
      
      // 移动到下一级 (Move to next level)
      current = current[part];
    }
    
    return current;
  }

  /**
   * 根据计数值获取适当的复数形式 (Get appropriate plural form based on count)
   * 
   * @param forms 复数形式对象 (Plural forms object)
   * @param count 计数值 (Count value)
   * @returns 选择的复数形式 (Selected plural form)
   */
  static getPluralForm(forms: Record<string, string>, count: number): string {
    // 如果forms不是对象，直接返回 (If forms is not an object, return directly)
    if (typeof forms !== 'object' || forms === null) {
      return String(forms);
    }
    
    // 检查是否有精确匹配 (Check if there's an exact match)
    if (forms[count.toString()]) {
      return forms[count.toString()];
    }
    
    // 根据复数规则选择合适的形式 (Select appropriate form based on plural rules)
    if (count === 0 && forms.zero) {
      return forms.zero;
    } else if (count === 1 && forms.one) {
      return forms.one;
    } else if (count === 2 && forms.two) {
      return forms.two;
    } else if (count > 2 && count < 5 && forms.few) {
      return forms.few;
    } else if (count >= 5 && forms.many) {
      return forms.many;
    } else if (forms.other) {
      return forms.other;
    }
    
    // 如果没有找到合适的形式，返回count转换为字符串
    // (If no appropriate form is found, return count converted to string)
    return String(count);
  }

  /**
   * 转义HTML特殊字符 (Escape HTML special characters)
   * 
   * @param str 要转义的字符串 (String to escape)
   * @returns 转义后的字符串 (Escaped string)
   */
  static escapeHtml(str: string): string {
    if (!str || typeof str !== 'string') {
      return str;
    }
    
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 判断字符串是否为合法的翻译键 (Check if string is a valid translation key)
   * 
   * @param key 要检查的键 (Key to check)
   * @returns 是否合法 (Whether it's valid)
   */
  static isValidKey(key: string): boolean {
    // 键必须是非空字符串 (Key must be a non-empty string)
    if (!key || typeof key !== 'string') {
      return false;
    }
    
    // 可以添加更多验证规则，例如禁止特殊字符等
    // (More validation rules can be added, e.g. prohibiting special characters)
    return true;
  }

  /**
   * 拼接命名空间和键 (Concatenate namespace and key)
   * 
   * @param namespace 命名空间 (Namespace)
   * @param key 翻译键 (Translation key)
   * @returns 完整的键名 (Complete key name)
   */
  static joinKey(namespace: string, key: string): string {
    if (!namespace) {
      return key;
    }
    
    return `${namespace}:${key}`;
  }

  /**
   * 分离命名空间和键 (Separate namespace and key)
   * 
   * @param fullKey 完整的键名，格式为 "namespace:key" (Complete key name, format "namespace:key")
   * @returns 包含命名空间和键的对象 (Object containing namespace and key)
   */
  static splitKey(fullKey: string): { namespace: string; key: string } {
    if (!fullKey || typeof fullKey !== 'string') {
      return { namespace: '', key: '' };
    }
    
    const parts = fullKey.split(':');
    
    if (parts.length === 1) {
      return { namespace: '', key: parts[0] };
    }
    
    return { namespace: parts[0], key: parts.slice(1).join(':') };
  }

  /**
   * 格式化带有变量的模板字符串 (Format template string with variables)
   * 简单版本，不使用正则表达式，性能更好 (Simple version without regular expressions, better performance)
   * 
   * @param template 模板字符串，如 "Hello, {name}!" (Template string, e.g. "Hello, {name}!")
   * @param variables 变量对象，如 { name: "World" } (Variable object, e.g. { name: "World" })
   * @param prefix 变量前缀，默认为 "{" (Variable prefix, default "{")
   * @param suffix 变量后缀，默认为 "}" (Variable suffix, default "}")
   * @returns 格式化后的字符串 (Formatted string)
   */
  static formatTemplate(
    template: string, 
    variables: Record<string, any>, 
    prefix: string = '{', 
    suffix: string = '}',
  ): string {
    if (!template || typeof template !== 'string') {
      return '';
    }
    
    if (!variables || typeof variables !== 'object') {
      return template;
    }
    
    let result = template;
    
    // 遍历所有变量，替换模板中的占位符
    // (Iterate through all variables, replace placeholders in template)
    for (const key in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        const value = variables[key];
        const placeholder = prefix + key + suffix;
        
        // 使用 split 和 join 而不是 replace，性能更好
        // (Use split and join instead of replace for better performance)
        result = result.split(placeholder).join(String(value));
      }
    }
    
    return result;
  }
}