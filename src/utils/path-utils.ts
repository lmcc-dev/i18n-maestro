/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 路径工具类 - 用于处理嵌套对象路径的工具函数集合
 * (Path utilities - collection of utility functions for handling nested object paths)
 */

/**
 * 从对象中根据路径获取值
 * (Get a value from an object based on a path)
 * 
 * @param obj 目标对象 (Target object)
 * @param path 路径字符串，使用点号分隔 (Path string, separated by dots)
 * @param defaultValue 如果路径不存在，返回的默认值 (Default value to return if path doesn't exist)
 * @returns 找到的值或默认值 (Found value or default value)
 * 
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * getByPath(obj, 'a.b.c'); // 返回 42
 * getByPath(obj, 'a.b.d', 'default'); // 返回 'default'
 */
export function getByPath<T = any>(
  obj: Record<string, any>, 
  path: string, 
  defaultValue?: T,
): T | undefined {
  if (!obj || !path) {
    return defaultValue;
  }

  // 将路径分割为部分 (Split the path into parts)
  const parts = path.split('.');
  let current: any = obj;

  // 遍历路径部分 (Traverse path parts)
  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) {
      return defaultValue;
    }

    current = current[parts[i]];
  }

  // 返回找到的值或默认值 (Return found value or default value)
  return current !== undefined ? current : defaultValue;
}

/**
 * 在对象上根据路径设置值
 * (Set a value on an object based on a path)
 * 
 * @param obj 目标对象 (Target object)
 * @param path 路径字符串，使用点号分隔 (Path string, separated by dots)
 * @param value 要设置的值 (Value to set)
 * @returns 修改后的对象 (Modified object)
 * 
 * @example
 * const obj = { a: { b: {} } };
 * setByPath(obj, 'a.b.c', 42); // obj 变为 { a: { b: { c: 42 } } }
 */
export function setByPath<T>(
  obj: Record<string, any>, 
  path: string, 
  value: T,
): Record<string, any> {
  if (!obj || !path) {
    return obj;
  }

  // 将路径分割为部分 (Split the path into parts)
  const parts = path.split('.');
  let current = obj;

  // 遍历路径部分，创建不存在的中间对象 
  // (Traverse path parts, creating intermediate objects if they don't exist)
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  // 设置最终值 (Set the final value)
  const lastKey = parts[parts.length - 1];
  current[lastKey] = value;

  return obj;
}

/**
 * 检查对象是否包含指定路径
 * (Check if an object contains a specified path)
 * 
 * @param obj 目标对象 (Target object)
 * @param path 路径字符串，使用点号分隔 (Path string, separated by dots)
 * @returns 路径是否存在 (Whether the path exists)
 * 
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * hasPath(obj, 'a.b.c'); // 返回 true
 * hasPath(obj, 'a.b.d'); // 返回 false
 */
export function hasPath(obj: Record<string, any>, path: string): boolean {
  if (!obj || !path) {
    return false;
  }

  // 将路径分割为部分 (Split the path into parts)
  const parts = path.split('.');
  let current: any = obj;

  // 遍历路径部分 (Traverse path parts)
  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined || !(parts[i] in current)) {
      return false;
    }
    current = current[parts[i]];
  }

  return true;
}

/**
 * 从对象中根据路径删除值
 * (Delete a value from an object based on a path)
 * 
 * @param obj 目标对象 (Target object)
 * @param path 路径字符串，使用点号分隔 (Path string, separated by dots)
 * @returns 是否成功删除 (Whether the deletion was successful)
 * 
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * deleteByPath(obj, 'a.b.c'); // obj 变为 { a: { b: {} } }
 */
export function deleteByPath(obj: Record<string, any>, path: string): boolean {
  if (!obj || !path) {
    return false;
  }

  // 将路径分割为部分 (Split the path into parts)
  const parts = path.split('.');
  let current: any = obj;

  // 遍历路径部分直到倒数第二个 (Traverse path parts until the second last)
  for (let i = 0; i < parts.length - 1; i++) {
    if (current === null || current === undefined || !(parts[i] in current)) {
      return false;
    }
    current = current[parts[i]];
  }

  // 删除最后一个键 (Delete the last key)
  const lastKey = parts[parts.length - 1];
  if (!(lastKey in current)) {
    return false;
  }

  return delete current[lastKey];
}