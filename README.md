# i18n-maestro

**A comprehensive and flexible internationalization solution that makes multilingual support simple.**

[中文文档](./README.zh-CN.md)

## Overview

i18n-maestro is a powerful internationalization toolkit designed to simplify the development and maintenance of multilingual applications. It provides a complete toolchain covering all aspects of internationalization development, from translation management to UI display.

### Features

- **Simple Integration** - Connect to any project with a configuration file
- **Multilingual Support** - Support for any number of languages with dynamic loading
- **Comprehensive Detection** - Automatic checking for missing and unused translation keys
- **Flexible Formatting** - Advanced text, date, number, and currency formatting
- **Cross-Platform Support** - Works with Node.js, React, Vue, and more
- **Development Tools** - Rich tools to assist translation development
- **High Performance** - Optimized loading and caching mechanisms
- **Robust Storage Adapters** - Memory, File System, and HTTP adapters with intelligent caching
- **Smart Error Handling** - Structured error objects with retry mechanisms for network operations

## Installation

```bash
npm install i18n-maestro
# or using pnpm
pnpm add i18n-maestro
```

## Basic Usage

### Configuration

Create an `i18n.config.js` file:

```javascript
export default {
  defaultLanguage: 'en-US',
  fallbackLanguage: 'en-US',
  languages: ['en-US', 'zh-CN', 'ja-JP'],
  resourcesPath: './src/i18n/locales',
  detection: {
    checkMissingKeys: true,
    checkUnusedKeys: true
  }
}
```

### Initialization

```javascript
import { createI18n } from 'i18n-maestro';
import config from '../i18n.config.js';

export const i18n = createI18n(config);

// Set the current language
i18n.setLanguage('en-US');

// Translate text
console.log(i18n.t('common.welcome')); // Output: Welcome to i18n-maestro
```

### Storage Adapters

i18n-maestro provides multiple storage adapters to load and save translation resources:

#### Memory Adapter

For in-memory translation storage:

```javascript
import { createI18n, MemoryAdapter } from 'i18n-maestro';

const memoryAdapter = new MemoryAdapter({
  resources: {
    'en-US': {
      common: {
        welcome: 'Welcome to i18n-maestro'
      }
    }
  }
});

const i18n = createI18n({
  adapter: memoryAdapter,
  // other config options
});
```

#### File System Adapter

For loading translations from local files:

```javascript
import { createI18n, FileSystemAdapter } from 'i18n-maestro';

const fsAdapter = new FileSystemAdapter({
  path: './locales',
  format: 'json'
});

const i18n = createI18n({
  adapter: fsAdapter,
  // other config options
});
```

#### HTTP Adapter

For loading translations from a remote server:

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
  // other config options
});
```

## Framework Integration

### React Integration

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
  return <h1>{t('greeting', { name: 'World' })}</h1>;
}
```

### Vue Integration

```vue
<script setup>
import { useI18n } from 'i18n-maestro/vue';

const { t, language, setLanguage } = useI18n();
</script>

<template>
  <h1>{{ t('greeting', { name: 'World' }) }}</h1>
  <select v-model="language" @change="setLanguage(language)">
    <option value="en-US">English</option>
    <option value="zh-CN">中文</option>
  </select>
</template>
```

## CLI Tools

```bash
# Initialize project
npx i18n-maestro init

# Check translation completeness
npx i18n-maestro check

# Generate reports
npx i18n-maestro report

# Extract translation keys from source code
npx i18n-maestro extract

# Generate type definitions
npx i18n-maestro generate-types
```

## Documentation

Visit [Full Documentation](https://github.com/lmcc-dev/i18n-maestro/wiki) for more details.

## Contributing

Contributions are welcome! Please read the [Contribution Guide](CONTRIBUTING.md) to learn how to participate in project development.

## License

MIT