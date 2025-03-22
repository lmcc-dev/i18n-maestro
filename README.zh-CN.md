# i18n-maestro

**一个全面且灵活的国际化解决方案，让多语言支持变得简单。**

[English Documentation](./README.md)

## 项目概述

i18n-maestro 是一个强大的国际化工具包，旨在简化多语言应用的开发和维护过程。它提供了完整的工具链，从翻译管理到界面展示，覆盖了国际化开发的各个方面。

### 特性

- **简单集成** - 通过配置文件一键接入任何项目
- **多语言支持** - 支持任意数量的语言，动态加载
- **全面检测** - 自动检查缺失和未使用的翻译键
- **灵活格式化** - 高级文本、日期、数字和货币格式化
- **跨平台支持** - 适用于Node.js、React、Vue等多种环境
- **开发工具** - 提供丰富的工具辅助翻译开发
- **高性能** - 优化的加载和缓存机制
- **强大的存储适配器** - 内存、文件系统和HTTP适配器，具有智能缓存功能
- **智能错误处理** - 结构化错误对象，网络操作具有自动重试机制

## 安装

```bash
npm install i18n-maestro
# 或使用 pnpm
pnpm add i18n-maestro
```

## 基本使用

### 配置

创建 `i18n.config.js` 文件：

```javascript
export default {
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
  languages: ['zh-CN', 'en-US', 'ja-JP'],
  resourcesPath: './src/i18n/locales',
  detection: {
    checkMissingKeys: true,
    checkUnusedKeys: true
  }
}
```

### 初始化

```javascript
import { createI18n } from 'i18n-maestro';
import config from '../i18n.config.js';

export const i18n = createI18n(config);

// 设置当前语言
i18n.setLanguage('zh-CN');

// 翻译文本
console.log(i18n.t('common.welcome')); // 输出：欢迎使用 i18n-maestro
```

### 存储适配器

i18n-maestro 提供多种存储适配器用于加载和保存翻译资源：

#### 内存适配器

用于内存中的翻译存储：

```javascript
import { createI18n, MemoryAdapter } from 'i18n-maestro';

const memoryAdapter = new MemoryAdapter({
  resources: {
    'zh-CN': {
      common: {
        welcome: '欢迎使用 i18n-maestro'
      }
    }
  }
});

const i18n = createI18n({
  adapter: memoryAdapter,
  // 其他配置选项
});
```

#### 文件系统适配器

用于从本地文件加载翻译：

```javascript
import { createI18n, FileSystemAdapter } from 'i18n-maestro';

const fsAdapter = new FileSystemAdapter({
  path: './locales',
  format: 'json'
});

const i18n = createI18n({
  adapter: fsAdapter,
  // 其他配置选项
});
```

#### HTTP适配器

用于从远程服务器加载翻译：

```javascript
import { createI18n, HttpAdapter } from 'i18n-maestro';

const httpAdapter = new HttpAdapter({
  baseUrl: 'https://api.example.com/i18n',
  timeout: 5000,
  maxRetries: 3,
  allowSaving: true
});

const i18n = createI18n({
  adapter: httpAdapter,
  // 其他配置选项
});
```

## 框架集成

### React集成

```jsx
import { I18nProvider, useTranslation } from 'i18n-maestro/react';

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, language } = useTranslation();
  return <h1>{t('greeting', { name: '世界' })}</h1>;
}
```

### Vue集成

```vue
<script setup>
import { useI18n } from 'i18n-maestro/vue';

const { t, language, setLanguage } = useI18n();
</script>

<template>
  <h1>{{ t('greeting', { name: '世界' }) }}</h1>
  <select v-model="language" @change="setLanguage(language)">
    <option value="en-US">English</option>
    <option value="zh-CN">中文</option>
  </select>
</template>
```

## 命令行工具

```bash
# 初始化项目
npx i18n-maestro init

# 检查翻译完整性
npx i18n-maestro check

# 生成报告
npx i18n-maestro report

# 从源代码提取翻译键
npx i18n-maestro extract

# 生成类型定义
npx i18n-maestro generate-types
```

## 文档

访问 [完整文档](https://github.com/lmcc-dev/i18n-maestro/wiki) 了解更多详情。

## 贡献

欢迎贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

MIT