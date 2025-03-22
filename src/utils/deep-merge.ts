/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import deepmerge from 'deepmerge';

/**
 * 深度合并多个对象 (Deep merge multiple objects)
 * 
 * 该函数使用递归策略将多个对象深度合并为一个新对象，不会修改原始对象
 * (This function uses a recursive strategy to deeply merge multiple objects into a new object without modifying the originals)
 * 
 * @param objects 要合并的对象数组 (Array of objects to merge)
 * @returns 合并后的新对象 (New merged object)
 */
export function deepMerge<T>(...objects: Partial<T>[]): T {
  // 过滤掉 null 和 undefined (Filter out null and undefined)
  const validObjects = objects.filter(obj => obj !== null && obj !== undefined) as object[];
  
  if (validObjects.length === 0) {
    return {} as T;
  }
  
  if (validObjects.length === 1) {
    return { ...validObjects[0] } as T;
  }
  
  // 使用 deepmerge 库进行深度合并 (Use deepmerge library for deep merging)
  const result = validObjects.reduce((acc, obj) => {
    return deepmerge(acc, obj, {
      // 数组合并策略：完全替换而非合并 (Array merge strategy: complete replacement rather than merging)
      arrayMerge: (_target, source) => [...source],
    });
  }, {});
  
  return result as T;
}

/**
 * 深度合并对象，可指定数组合并策略
 * (Deep merge objects with customizable array merge strategy)
 * 
 * @param target 目标对象 (Target object)
 * @param source 源对象 (Source object)
 * @param options 合并选项 (Merge options)
 * @returns 合并后的新对象 (New merged object)
 */
export function deepMergeWithOptions<T>(
  target: Partial<T>,
  source: Partial<T>,
  options?: { arrayMerge?: 'replace' | 'concat' },
): T {
  const arrayMergeStrategy = options?.arrayMerge === 'concat' 
    ? (target: any[], source: any[]) => [...target, ...source]
    : (_target: any[], source: any[]) => [...source];
  
  return deepmerge(target, source, { arrayMerge: arrayMergeStrategy }) as T;
}

/**
 * 检查是否为对象
 * (Check if it's an object)
 * 
 * @param obj1 The first object to merge
 * @param obj2 The second object to merge
 * @returns A new merged object
 */
export function isObject(item: unknown): boolean {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}