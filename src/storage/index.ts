/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 存储适配器入口文件 (Storage adapters entry file)
 * 
 * 该文件导出所有存储适配器，用于加载和保存翻译资源
 * (This file exports all storage adapters for loading and saving translation resources)
 */

export * from './storage-adapter';
export * from './memory-adapter';
export * from './file-system-adapter';
export * from './http-adapter';

// 为方便使用而设置的默认导出 (Default exports for convenience)
import { MemoryAdapter } from './memory-adapter';
import { FileSystemAdapter } from './file-system-adapter';
import { HttpAdapter } from './http-adapter';

export default {
  Memory: MemoryAdapter,
  FileSystem: FileSystemAdapter,
  Http: HttpAdapter,
};