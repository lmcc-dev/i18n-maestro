/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { I18nEvent, I18nEventType } from '../types';

/**
 * 事件监听器类型 (Event listener type)
 */
type EventListener = (event: I18nEvent) => void;

/**
 * 事件发射器类 - 实现事件的发布和订阅机制
 * (Event emitter class - implements publish/subscribe pattern)
 * 
 * 用于管理事件的注册、移除和触发，实现系统各组件间的解耦通信
 * (Used to manage event registration, removal and triggering, enabling decoupled communication between system components)
 */
export class EventEmitter {
  /**
   * 事件监听器映射表 (Event listeners map)
   * 以事件类型作为键，对应的监听器数组作为值
   * (Event type as key, array of listeners as value)
   */
  private listeners: Map<I18nEventType, EventListener[]>;

  /**
   * 构造函数 (Constructor)
   */
  constructor() {
    this.listeners = new Map<I18nEventType, EventListener[]>();
  }

  /**
   * 注册事件监听器 (Register event listener)
   * @param type 事件类型 (Event type)
   * @param listener 监听器函数 (Listener function)
   */
  public on(type: I18nEventType, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    const listeners = this.listeners.get(type);
    if (listeners && !listeners.includes(listener)) {
      listeners.push(listener);
    }
  }

  /**
   * 移除事件监听器 (Remove event listener)
   * @param type 事件类型 (Event type)
   * @param listener 监听器函数 (Listener function)
   */
  public off(type: I18nEventType, listener: EventListener): void {
    const listeners = this.listeners.get(type);
    if (!listeners) return;

    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // 如果没有监听器了，移除该事件类型 (If no listeners left, remove the event type)
    if (listeners.length === 0) {
      this.listeners.delete(type);
    }
  }

  /**
   * 触发事件 (Emit event)
   * @param type 事件类型 (Event type)
   * @param payload 事件数据 (Event data)
   */
  public emit(type: I18nEventType, payload: any): void {
    const listeners = this.listeners.get(type);
    if (!listeners) return;

    const event: I18nEvent = { type, payload };

    // 创建监听器数组的副本进行遍历，避免在回调中修改数组导致的问题
    // (Create a copy of listeners array for iteration to avoid issues if callbacks modify the array)
    [...listeners].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for event ${type}:`, error);
      }
    });
  }

  /**
   * 检查是否有特定类型的事件监听器
   * (Check if there are listeners for a specific event type)
   * @param type 事件类型 (Event type)
   * @returns 是否有监听器 (Whether there are listeners)
   */
  public hasListeners(type: I18nEventType): boolean {
    const listeners = this.listeners.get(type);
    return !!listeners && listeners.length > 0;
  }

  /**
   * 移除所有监听器 (Remove all listeners)
   * @param type 可选的事件类型，如果提供则只移除该类型的监听器
   * (Optional event type, if provided only removes listeners of that type)
   */
  public removeAllListeners(type?: I18nEventType): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 获取特定类型的监听器数量
   * (Get the number of listeners for a specific type)
   * @param type 事件类型 (Event type)
   * @returns 监听器数量 (Number of listeners)
   */
  public listenerCount(type: I18nEventType): number {
    const listeners = this.listeners.get(type);
    return listeners ? listeners.length : 0;
  }
}