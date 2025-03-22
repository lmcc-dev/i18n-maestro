/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { I18nEventType, I18nEvent } from '../types';

/**
 * 事件管理器类，处理事件订阅和触发 (Event manager class, handles event subscription and triggering)
 */
export class EventManager {
  // 事件监听器映射: { 事件类型 -> 监听器函数数组 }
  // (Event listener map: { event type -> array of listener functions })
  private listeners: Map<I18nEventType, Array<(event: I18nEvent) => void>> = new Map();

  /**
   * 添加事件监听器 (Add event listener)
   * @param type 事件类型 (Event type)
   * @param listener 监听器函数 (Listener function)
   */
  on(type: I18nEventType, listener: (event: I18nEvent) => void): void {
    // 如果事件类型不存在，创建新数组 (If event type doesn't exist, create new array)
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    // 获取监听器数组 (Get listener array)
    const typeListeners = this.listeners.get(type)!;
    
    // 添加监听器，避免重复添加 (Add listener, avoid adding duplicates)
    if (!typeListeners.includes(listener)) {
      typeListeners.push(listener);
    }
  }

  /**
   * 移除事件监听器 (Remove event listener)
   * @param type 事件类型 (Event type)
   * @param listener 监听器函数 (Listener function)
   */
  off(type: I18nEventType, listener: (event: I18nEvent) => void): void {
    // 如果事件类型不存在，直接返回 (If event type doesn't exist, return)
    if (!this.listeners.has(type)) {
      return;
    }
    
    // 获取监听器数组 (Get listener array)
    const typeListeners = this.listeners.get(type)!;
    
    // 移除指定的监听器 (Remove specified listener)
    const index = typeListeners.indexOf(listener);
    if (index !== -1) {
      typeListeners.splice(index, 1);
    }
    
    // 如果没有更多监听器，移除整个事件类型 (If no more listeners, remove entire event type)
    if (typeListeners.length === 0) {
      this.listeners.delete(type);
    }
  }

  /**
   * 添加一次性事件监听器 (Add one-time event listener)
   * @param type 事件类型 (Event type)
   * @param listener 监听器函数 (Listener function)
   */
  once(type: I18nEventType, listener: (event: I18nEvent) => void): void {
    // 创建包装函数，执行后自动移除 (Create wrapper function that auto-removes after execution)
    const onceWrapper = (event: I18nEvent) => {
      listener(event);
      this.off(type, onceWrapper);
    };
    
    // 添加包装后的监听器 (Add wrapped listener)
    this.on(type, onceWrapper);
  }

  /**
   * 触发事件 (Emit event)
   * @param type 事件类型 (Event type)
   * @param payload 事件数据 (Event data)
   */
  emit(type: I18nEventType, payload: any): void {
    // 如果事件类型不存在，直接返回 (If event type doesn't exist, return)
    if (!this.listeners.has(type)) {
      return;
    }
    
    // 创建事件对象 (Create event object)
    const event: I18nEvent = { type, payload };
    
    // 复制监听器数组，防止在迭代过程中修改导致问题
    // (Copy listener array to prevent issues from modifications during iteration)
    const typeListeners = [...this.listeners.get(type)!];
    
    // 调用所有监听器 (Call all listeners)
    for (const listener of typeListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`事件监听器执行错误: ${error}`);
      }
    }
  }

  /**
   * 移除所有监听器 (Remove all listeners)
   * @param type 可选事件类型，不指定则移除所有类型 (Optional event type, removes all types if not specified)
   */
  removeAllListeners(type?: I18nEventType): void {
    if (type) {
      // 移除指定类型的所有监听器 (Remove all listeners of specified type)
      this.listeners.delete(type);
    } else {
      // 移除所有类型的监听器 (Remove listeners of all types)
      this.listeners.clear();
    }
  }

  /**
   * 获取监听器数量 (Get listener count)
   * @param type 事件类型 (Event type)
   * @returns 监听器数量 (Listener count)
   */
  listenerCount(type: I18nEventType): number {
    if (!this.listeners.has(type)) {
      return 0;
    }
    
    return this.listeners.get(type)!.length;
  }

  /**
   * 获取所有事件类型 (Get all event types)
   * @returns 事件类型数组 (Array of event types)
   */
  eventTypes(): I18nEventType[] {
    return Array.from(this.listeners.keys());
  }
}