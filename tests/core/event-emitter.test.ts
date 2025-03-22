/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from '../../src/core/event-emitter';
import { I18nEventType } from '../../src/types';

describe('事件发射器测试 (Event emitter test)', () => {
  let emitter: EventEmitter;
  
  beforeEach(() => {
    emitter = new EventEmitter();
  });
  
  describe('on/emit', () => {
    it('应该注册监听器并触发事件 (should register listeners and emit events)', () => {
      const listener = vi.fn();
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener);
      
      const payload = { lang: 'zh-CN' };
      emitter.emit(I18nEventType.LANGUAGE_CHANGED, payload);
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        type: I18nEventType.LANGUAGE_CHANGED,
        payload
      });
    });
    
    it('应该支持多个监听器 (should support multiple listeners)', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener1);
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener2);
      
      emitter.emit(I18nEventType.LANGUAGE_CHANGED, { lang: 'zh-CN' });
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
    
    it('应该支持多种事件类型 (should support multiple event types)', () => {
      const languageChangedListener = vi.fn();
      const resourcesLoadedListener = vi.fn();
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, languageChangedListener);
      emitter.on(I18nEventType.RESOURCES_LOADED, resourcesLoadedListener);
      
      emitter.emit(I18nEventType.LANGUAGE_CHANGED, { lang: 'zh-CN' });
      
      expect(languageChangedListener).toHaveBeenCalledTimes(1);
      expect(resourcesLoadedListener).not.toHaveBeenCalled();
    });
    
    it('监听器错误不应中断其他监听器 (listener errors should not interrupt other listeners)', () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();
      
      // 监听错误输出 (Spy on error output)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, errorListener);
      emitter.on(I18nEventType.LANGUAGE_CHANGED, normalListener);
      
      emitter.emit(I18nEventType.LANGUAGE_CHANGED, { lang: 'zh-CN' });
      
      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(normalListener).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('off', () => {
    it('应该移除注册的监听器 (should remove registered listeners)', () => {
      const listener = vi.fn();
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener);
      emitter.off(I18nEventType.LANGUAGE_CHANGED, listener);
      
      emitter.emit(I18nEventType.LANGUAGE_CHANGED, { lang: 'zh-CN' });
      
      expect(listener).not.toHaveBeenCalled();
    });
    
    it('应该只移除指定的监听器 (should only remove the specified listener)', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener1);
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener2);
      
      emitter.off(I18nEventType.LANGUAGE_CHANGED, listener1);
      
      emitter.emit(I18nEventType.LANGUAGE_CHANGED, { lang: 'zh-CN' });
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
    
    it('移除不存在的监听器应该安全 (removing non-existent listeners should be safe)', () => {
      const listener = vi.fn();
      
      // 移除未注册的监听器 (Remove unregistered listener)
      emitter.off(I18nEventType.LANGUAGE_CHANGED, listener);
      
      // 移除不存在的事件类型 (Remove non-existent event type)
      emitter.off(I18nEventType.RESOURCES_LOADED, listener);
      
      // 确保不会抛出错误 (Ensure no errors are thrown)
      expect(() => {
        emitter.emit(I18nEventType.LANGUAGE_CHANGED, { lang: 'zh-CN' });
      }).not.toThrow();
    });
  });
  
  describe('hasListeners', () => {
    it('应该正确报告是否有监听器 (should correctly report if there are listeners)', () => {
      expect(emitter.hasListeners(I18nEventType.LANGUAGE_CHANGED)).toBe(false);
      
      const listener = vi.fn();
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener);
      
      expect(emitter.hasListeners(I18nEventType.LANGUAGE_CHANGED)).toBe(true);
      expect(emitter.hasListeners(I18nEventType.RESOURCES_LOADED)).toBe(false);
    });
  });
  
  describe('removeAllListeners', () => {
    it('应该移除指定类型的所有监听器 (should remove all listeners of a specified type)', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const otherListener = vi.fn();
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener1);
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener2);
      emitter.on(I18nEventType.RESOURCES_LOADED, otherListener);
      
      emitter.removeAllListeners(I18nEventType.LANGUAGE_CHANGED);
      
      emitter.emit(I18nEventType.LANGUAGE_CHANGED, { lang: 'zh-CN' });
      emitter.emit(I18nEventType.RESOURCES_LOADED, { resources: {} });
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(otherListener).toHaveBeenCalledTimes(1);
    });
    
    it('不带参数应该移除所有监听器 (should remove all listeners when called without arguments)', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener1);
      emitter.on(I18nEventType.RESOURCES_LOADED, listener2);
      
      emitter.removeAllListeners();
      
      emitter.emit(I18nEventType.LANGUAGE_CHANGED, { lang: 'zh-CN' });
      emitter.emit(I18nEventType.RESOURCES_LOADED, { resources: {} });
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
  
  describe('listenerCount', () => {
    it('应该返回指定类型的监听器数量 (should return the number of listeners for a specified type)', () => {
      expect(emitter.listenerCount(I18nEventType.LANGUAGE_CHANGED)).toBe(0);
      
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener1);
      expect(emitter.listenerCount(I18nEventType.LANGUAGE_CHANGED)).toBe(1);
      
      emitter.on(I18nEventType.LANGUAGE_CHANGED, listener2);
      expect(emitter.listenerCount(I18nEventType.LANGUAGE_CHANGED)).toBe(2);
      
      emitter.off(I18nEventType.LANGUAGE_CHANGED, listener1);
      expect(emitter.listenerCount(I18nEventType.LANGUAGE_CHANGED)).toBe(1);
    });
  });
});