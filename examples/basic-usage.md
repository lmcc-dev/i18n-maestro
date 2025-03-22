# i18n-maestro 基本使用示例

本文档展示 i18n-maestro 的基本用法和主要功能，帮助开发者快速上手。

## 基础安装与配置

### 安装

```bash
# 使用 npm
npm install i18n-maestro

# 使用 pnpm
pnpm add i18n-maestro
```

### 基本配置

创建配置文件 `i18n.config.js`:

```javascript
export default {
  // 默认语言
  defaultLanguage: 'zh-CN',
  
  // 回退语言，当默认语言缺少翻译时使用
  fallbackLanguage: 'en-US',
  
  // 支持的语言列表
  languages: ['zh-CN', 'en-US', 'ja-JP'],
  
  // 翻译资源路径
  resourcesPath: './src/i18n/locales',
  
  // 检测选项
  detection: {
    // 检查缺失的翻译键
    checkMissingKeys: true,
    
    // 检查未使用的翻译键
    checkUnusedKeys: true,
    
    // 缺失键处理策略: error(抛出错误), warn(仅警告), silent(静默)
    missingKeyStrategy: 'warn'
  },
  
  // 翻译选项
  translation: {
    // 命名空间设置
    namespaces: ['common', 'user', 'admin'],
    defaultNamespace: 'common',
    
    // 插值设置
    interpolation: {
      prefix: '{',
      suffix: '}',
      escapeValue: true  // 是否转义HTML
    }
  },
  
  // 格式化选项
  formatting: {
    // 日期格式化默认选项
    date: {
      'zh-CN': { dateStyle: 'full' },
      'en-US': { dateStyle: 'long' }
    },
    
    // 数字格式化默认选项
    number: {
      'zh-CN': { style: 'decimal', useGrouping: true },
      'en-US': { style: 'decimal', useGrouping: true }
    }
  },
  
  // 插件
  plugins: []
}
```

## 翻译文件结构

创建翻译文件，例如 `src/i18n/locales/zh-CN/common.json`:

```json
{
  "welcome": "欢迎使用 i18n-maestro",
  "greeting": "你好，{name}！",
  "items": {
    "zero": "没有项目",
    "one": "1个项目",
    "other": "{count}个项目"
  },
  "profile": {
    "title": "个人资料",
    "labels": {
      "name": "姓名",
      "email": "电子邮箱",
      "age": "年龄"
    },
    "buttons": {
      "save": "保存",
      "cancel": "取消"
    }
  }
}
```

英文版本 `src/i18n/locales/en-US/common.json`:

```json
{
  "welcome": "Welcome to i18n-maestro",
  "greeting": "Hello, {name}!",
  "items": {
    "zero": "No items",
    "one": "1 item",
    "other": "{count} items"
  },
  "profile": {
    "title": "Profile",
    "labels": {
      "name": "Name",
      "email": "Email",
      "age": "Age"
    },
    "buttons": {
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

## 基本使用

### 初始化翻译实例

```javascript
import { createI18n } from 'i18n-maestro';
import config from './i18n.config.js';

// 创建实例
export const i18n = createI18n(config);

// 设置当前语言（可选，默认使用配置中的defaultLanguage）
i18n.setLanguage('zh-CN');
```

### 基本翻译

```javascript
// 简单键
console.log(i18n.t('welcome'));
// 输出: "欢迎使用 i18n-maestro"

// 带插值的翻译
console.log(i18n.t('greeting', { name: '张三' }));
// 输出: "你好，张三！"

// 嵌套键
console.log(i18n.t('profile.title'));
// 输出: "个人资料"

// 带命名空间的翻译
console.log(i18n.t('title', { ns: 'user' }));
// 输出: 用户列表 (假设user命名空间有这个键)

// 带默认值的翻译（当键不存在时使用）
console.log(i18n.t('missing.key', { defaultValue: '未找到' }));
// 输出: "未找到"
```

### 复数形式处理

```javascript
// 零个项目
console.log(i18n.t('items', { count: 0 }));
// 输出: "没有项目"

// 一个项目
console.log(i18n.t('items', { count: 1 }));
// 输出: "1个项目"

// 多个项目
console.log(i18n.t('items', { count: 5 }));
// 输出: "5个项目"
```

### 语言切换

```javascript
// 切换到英文
i18n.setLanguage('en-US');

console.log(i18n.t('welcome'));
// 输出: "Welcome to i18n-maestro"

console.log(i18n.t('greeting', { name: 'John' }));
// 输出: "Hello, John!"

// 获取当前语言
console.log(i18n.getLanguage());
// 输出: "en-US"

// 获取所有支持的语言
console.log(i18n.getLanguages());
// 输出: ["zh-CN", "en-US", "ja-JP"]

// 检查语言是否存在
console.log(i18n.hasLanguage('fr-FR'));
// 输出: false
```

## 格式化功能

### 日期格式化

```javascript
const date = new Date(2023, 5, 15);

// 使用默认选项格式化
console.log(i18n.formatDate(date));
// 中文环境: "2023年6月15日"
// 英文环境: "June 15, 2023"

// 自定义格式化选项
console.log(i18n.formatDate(date, { 
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));
// 中文环境: "2023年6月15日星期四"
// 英文环境: "Thursday, June 15, 2023"
```

### 数字格式化

```javascript
// 基本数字格式化
console.log(i18n.formatNumber(1234567.89));
// 中文环境: "1,234,567.89"
// 英文环境: "1,234,567.89"

// 百分比格式化
console.log(i18n.formatNumber(0.3456, { style: 'percent' }));
// 中文环境: "34.56%"
// 英文环境: "34.56%"

// 货币格式化
console.log(i18n.formatCurrency(1234.56, 'CNY'));
// 中文环境: "¥1,234.56"
// 英文环境: "CN¥1,234.56"

console.log(i18n.formatCurrency(1234.56, 'USD'));
// 中文环境: "US$1,234.56"
// 英文环境: "$1,234.56"
```

## 高级功能

### 检查翻译键是否存在

```javascript
// 检查键是否存在
console.log(i18n.exists('welcome'));
// 输出: true

console.log(i18n.exists('nonexistent.key'));
// 输出: false

// 检查特定命名空间中的键
console.log(i18n.exists('user.list', { ns: 'admin' }));
// 输出: true/false 取决于admin命名空间是否有这个键
```

### 翻译键完整性检查

```javascript
// 获取所有缺失的翻译键
const missingKeys = i18n.getMissingKeys();
console.log(missingKeys);
// 输出: ['admin.dashboard.title', 'user.profile.address', ...]

// 获取未使用的翻译键
const unusedKeys = i18n.getUnusedKeys();
console.log(unusedKeys);
// 输出: ['old.feature.label', 'deprecated.setting', ...]

// 生成翻译报告
const report = i18n.generateReport();
console.log(report);
// 输出翻译完整性报告对象
```

### 动态添加翻译

```javascript
// 添加单个翻译键
i18n.addTranslation('zh-CN', 'newKey', '新增键值');

// 添加多个翻译键
i18n.addTranslations('zh-CN', {
  'feature.title': '功能标题',
  'feature.description': '功能描述'
});

// 添加命名空间翻译
i18n.addNamespaceTranslations('zh-CN', 'newFeature', {
  'title': '新功能',
  'description': '这是一个新功能'
});

// 使用新添加的翻译
console.log(i18n.t('newKey'));
// 输出: "新增键值"

console.log(i18n.t('title', { ns: 'newFeature' }));
// 输出: "新功能"
```

## 命令行工具使用

i18n-maestro 提供了命令行工具简化国际化管理：

```bash
# 初始化项目
npx i18n-maestro init

# 检查翻译完整性
npx i18n-maestro check

# 提取代码中的翻译键
npx i18n-maestro extract --src ./src

# 生成翻译报告
npx i18n-maestro report --output ./i18n-report.json

# 同步翻译文件
npx i18n-maestro sync

# 启动翻译编辑器
npx i18n-maestro edit
```

## 小结

以上展示了 i18n-maestro 的基本使用方法。完整功能和高级配置请参考官方文档。i18n-maestro 提供了丰富的国际化能力，灵活且易于使用，可以满足从简单到复杂的各种国际化需求。