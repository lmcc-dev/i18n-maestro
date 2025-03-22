/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect } from 'vitest';
import { getByPath, setByPath, hasPath, deleteByPath } from '../../src/utils/path-utils';

describe('路径工具函数测试 (Path utility functions test)', () => {
  describe('getByPath', () => {
    it('应该能获取对象中的嵌套值 (should get nested value from object)', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(getByPath(obj, 'a.b.c')).toBe(42);
    });

    it('路径不存在时应该返回undefined (should return undefined when path does not exist)', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(getByPath(obj, 'a.b.d')).toBeUndefined();
    });

    it('路径不存在时应该返回默认值 (should return default value when path does not exist)', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(getByPath(obj, 'a.b.d', 'default')).toBe('default');
    });

    it('处理空对象和空路径 (should handle empty object and path)', () => {
      expect(getByPath({}, 'a.b.c', 'default')).toBe('default');
      expect(getByPath({ a: 1 }, '', 'default')).toBe('default');
      expect(getByPath({} as any, null as any, 'default')).toBe('default');
    });
  });

  describe('setByPath', () => {
    it('应该能在对象上设置嵌套值 (should set nested value on object)', () => {
      const obj = { a: { b: {} } };
      setByPath(obj, 'a.b.c', 42);
      expect(obj.a.b).toHaveProperty('c', 42);
    });

    it('应该创建不存在的中间对象 (should create intermediate objects if they do not exist)', () => {
      const obj = {};
      setByPath(obj, 'a.b.c', 42);
      expect(obj).toHaveProperty('a');
      expect(obj).toHaveProperty('a.b');
      expect(obj).toHaveProperty('a.b.c', 42);
    });

    it('处理空对象和空路径 (should handle empty object and path)', () => {
      let obj = {};
      setByPath(obj, '', 42);
      expect(obj).toEqual({});

      obj = { a: 1 };
      setByPath(obj as any, null as any, 42);
      expect(obj).toEqual({ a: 1 });
    });
  });

  describe('hasPath', () => {
    it('应该检测对象中存在的路径 (should detect existing path in object)', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(hasPath(obj, 'a.b.c')).toBe(true);
    });

    it('应该检测对象中不存在的路径 (should detect non-existing path in object)', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(hasPath(obj, 'a.b.d')).toBe(false);
      expect(hasPath(obj, 'a.d.c')).toBe(false);
    });

    it('处理空对象和空路径 (should handle empty object and path)', () => {
      expect(hasPath({}, 'a.b.c')).toBe(false);
      expect(hasPath({ a: 1 }, '')).toBe(false);
      expect(hasPath({} as any, null as any)).toBe(false);
    });
  });

  describe('deleteByPath', () => {
    it('应该删除对象中的嵌套值 (should delete nested value from object)', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(deleteByPath(obj, 'a.b.c')).toBe(true);
      expect(obj.a.b).not.toHaveProperty('c');
    });

    it('删除不存在的路径时应该返回false (should return false when deleting non-existing path)', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(deleteByPath(obj, 'a.b.d')).toBe(false);
      expect(deleteByPath(obj, 'a.d.c')).toBe(false);
    });

    it('处理空对象和空路径 (should handle empty object and path)', () => {
      expect(deleteByPath({}, 'a.b.c')).toBe(false);
      expect(deleteByPath({ a: 1 }, '')).toBe(false);
      expect(deleteByPath({} as any, null as any)).toBe(false);
    });
  });
});