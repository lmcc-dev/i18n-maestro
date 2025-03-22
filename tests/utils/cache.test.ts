/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SimpleCache } from '../../src/utils/cache';

describe('缓存类测试 (Cache class test)', () => {
  let cache: SimpleCache<string, number>;
  
  beforeEach(() => {
    // 重置模拟计时器 (Reset mock timers)
    vi.useFakeTimers();
    // 创建新的缓存实例 (Create new cache instance)
    cache = new SimpleCache<string, number>();
  });
  
  afterEach(() => {
    // 恢复真实计时器 (Restore real timers)
    vi.useRealTimers();
  });
  
  describe('基本功能 (Basic functionality)', () => {
    it('应该能设置和获取值 (should set and get values)', () => {
      cache.set('key1', 42);
      expect(cache.get('key1')).toBe(42);
    });
    
    it('不存在的键应该返回undefined (should return undefined for non-existent keys)', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });
    
    it('应该检查键是否存在 (should check if a key exists)', () => {
      cache.set('key1', 42);
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });
    
    it('应该删除键 (should delete a key)', () => {
      cache.set('key1', 42);
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.delete('nonexistent')).toBe(false);
    });
    
    it('应该清空缓存 (should clear the cache)', () => {
      cache.set('key1', 42);
      cache.set('key2', 84);
      cache.clear();
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.size()).toBe(0);
    });
    
    it('应该获取所有键 (should get all keys)', () => {
      cache.set('key1', 42);
      cache.set('key2', 84);
      expect(cache.keys()).toEqual(expect.arrayContaining(['key1', 'key2']));
      expect(cache.keys().length).toBe(2);
    });
    
    it('应该获取缓存大小 (should get cache size)', () => {
      expect(cache.size()).toBe(0);
      cache.set('key1', 42);
      cache.set('key2', 84);
      expect(cache.size()).toBe(2);
    });
  });
  
  describe('过期功能 (Expiry functionality)', () => {
    it('应该支持项目过期 (should support item expiration)', () => {
      // 创建带默认过期时间的缓存 (Create cache with default expiry)
      const expirableCache = new SimpleCache<string, number>(1000); // 1秒后过期 (expires after 1 second)
      
      expirableCache.set('key1', 42);
      expect(expirableCache.get('key1')).toBe(42);
      
      // 前进500毫秒 (Advance 500ms)
      vi.advanceTimersByTime(500);
      expect(expirableCache.get('key1')).toBe(42);
      
      // 前进剩余时间加100毫秒 (Advance remaining time plus 100ms)
      vi.advanceTimersByTime(600);
      expect(expirableCache.get('key1')).toBeUndefined();
    });
    
    it('应该支持单个项目指定过期时间 (should support specifying expiry for individual items)', () => {
      cache.set('key1', 42, 500); // 500毫秒后过期 (expires after 500ms)
      cache.set('key2', 84, 2000); // 2秒后过期 (expires after 2 seconds)
      
      expect(cache.get('key1')).toBe(42);
      expect(cache.get('key2')).toBe(84);
      
      // 前进600毫秒 (Advance 600ms)
      vi.advanceTimersByTime(600);
      expect(cache.get('key1')).toBeUndefined(); // 已过期 (expired)
      expect(cache.get('key2')).toBe(84); // 未过期 (not expired)
      
      // 再前进1500毫秒 (Advance another 1500ms)
      vi.advanceTimersByTime(1500);
      expect(cache.get('key2')).toBeUndefined(); // 现在也过期了 (now expired)
    });
    
    it('调用has()方法应该删除过期项目 (calling has() should remove expired items)', () => {
      cache.set('key1', 42, 1000);
      expect(cache.has('key1')).toBe(true);
      
      // 前进1100毫秒 (Advance 1100ms)
      vi.advanceTimersByTime(1100);
      expect(cache.has('key1')).toBe(false);
    });
    
    it('keys()方法应该排除过期项目 (keys() should exclude expired items)', () => {
      cache.set('key1', 42, 500);
      cache.set('key2', 84, 2000);
      
      expect(cache.keys().length).toBe(2);
      
      // 前进600毫秒 (Advance 600ms)
      vi.advanceTimersByTime(600);
      const keys = cache.keys();
      expect(keys.length).toBe(1);
      expect(keys).toContain('key2');
      expect(keys).not.toContain('key1');
    });
  });
  
  describe('getOrSet功能 (getOrSet functionality)', () => {
    it('应该从工厂函数获取新值并缓存 (should get new value from factory function and cache it)', () => {
      const factory = vi.fn(() => 42);
      
      const value = cache.getOrSet('key1', factory);
      expect(value).toBe(42);
      expect(factory).toHaveBeenCalledTimes(1);
      
      // 第二次调用应该使用缓存值 (Second call should use cached value)
      const value2 = cache.getOrSet('key1', factory);
      expect(value2).toBe(42);
      expect(factory).toHaveBeenCalledTimes(1); // 工厂函数不应再次调用 (Factory should not be called again)
    });
    
    it('工厂函数应该为过期值重新调用 (factory function should be called again for expired values)', () => {
      const factory = vi.fn(() => 42);
      
      // 设置较短的过期时间 (Set short expiry)
      const value = cache.getOrSet('key1', factory, 500);
      expect(value).toBe(42);
      expect(factory).toHaveBeenCalledTimes(1);
      
      // 前进600毫秒 (Advance 600ms)
      vi.advanceTimersByTime(600);
      
      // 值应该已过期，工厂应重新调用 (Value should be expired, factory should be called again)
      const value2 = cache.getOrSet('key1', factory);
      expect(value2).toBe(42);
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });
});