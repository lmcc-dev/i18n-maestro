/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect } from 'vitest';
import { deepMerge, deepMergeWithOptions } from '../../src/utils/deep-merge';

describe('深度合并工具函数测试 (Deep merge utility functions test)', () => {
  describe('deepMerge', () => {
    it('应该合并多个对象 (should merge multiple objects)', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const result = deepMerge(obj1, obj2);
      
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it('数组应该被替换而不是合并 (arrays should be replaced, not merged)', () => {
      const obj1 = { a: [1, 2, 3] };
      const obj2 = { a: [4, 5] };
      const result = deepMerge(obj1, obj2);
      
      expect(result).toEqual({ a: [4, 5] });
    });

    it('应该处理null和undefined (should handle null and undefined)', () => {
      const obj1 = { a: 1 };
      const result1 = deepMerge(obj1, null as any, undefined as any);
      const result2 = deepMerge(null as any, undefined as any, obj1);
      
      expect(result1).toEqual({ a: 1 });
      expect(result2).toEqual({ a: 1 });
    });

    it('处理空参数 (should handle empty arguments)', () => {
      const result = deepMerge();
      expect(result).toEqual({});
    });

    it('处理单个对象 (should handle single object)', () => {
      const obj = { a: 1, b: 2 };
      const result = deepMerge(obj);
      
      expect(result).toEqual(obj);
      expect(result).not.toBe(obj); // 应该是新对象 (should be a new object)
    });
  });

  describe('deepMergeWithOptions', () => {
    it('使用替换策略时数组应该被替换 (arrays should be replaced with replace strategy)', () => {
      const obj1 = { a: [1, 2, 3] };
      const obj2 = { a: [4, 5] };
      const result = deepMergeWithOptions(obj1, obj2, { arrayMerge: 'replace' });
      
      expect(result).toEqual({ a: [4, 5] });
    });

    it('使用连接策略时数组应该被合并 (arrays should be concatenated with concat strategy)', () => {
      const obj1 = { a: [1, 2, 3] };
      const obj2 = { a: [4, 5] };
      const result = deepMergeWithOptions(obj1, obj2, { arrayMerge: 'concat' });
      
      expect(result).toEqual({ a: [1, 2, 3, 4, 5] });
    });

    it('默认应该使用替换策略 (should use replace strategy by default)', () => {
      const obj1 = { a: [1, 2, 3] };
      const obj2 = { a: [4, 5] };
      const result = deepMergeWithOptions(obj1, obj2);
      
      expect(result).toEqual({ a: [4, 5] });
    });
  });
});