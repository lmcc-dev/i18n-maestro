# i18n-maestro React 集成示例

本文档展示如何在 React 应用中集成和使用 i18n-maestro，实现完整的国际化功能。

## 安装

```bash
# 安装核心库和React支持
npm install i18n-maestro i18n-maestro-react

# 或使用 pnpm
pnpm add i18n-maestro i18n-maestro-react
```

## 基础设置

### 配置文件

创建 `src/i18n/i18n.config.js`:

```javascript
export default {
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
  languages: ['zh-CN', 'en-US'],
  resourcesPath: './src/i18n/locales',
  detection: {
    checkMissingKeys: true,
    missingKeyStrategy: process.env.NODE_ENV === 'development' ? 'warn' : 'silent'
  },
  translation: {
    namespaces: ['common', 'home', 'user', 'settings'],
    defaultNamespace: 'common',
    interpolation: {
      escapeValue: false  // React 会自动处理转义
    }
  },
  react: {
    useSuspense: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'a', 'ul', 'li']
  }
}
```

### 创建 i18n 实例

新建 `src/i18n/index.js`:

```javascript
import { createI18n } from 'i18n-maestro';
import { initReactI18n } from 'i18n-maestro-react';
import config from './i18n.config.js';

// 创建核心实例
const i18n = createI18n(config);

// 初始化 React 支持
initReactI18n(i18n);

export default i18n;
```

### 添加翻译文件

创建 `src/i18n/locales/zh-CN/common.json`:

```json
{
  "app": {
    "name": "我的应用",
    "loading": "加载中...",
    "error": "出错了！",
    "notFound": "页面不存在"
  },
  "nav": {
    "home": "首页",
    "user": "用户",
    "settings": "设置",
    "logout": "退出登录"
  },
  "actions": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索"
  },
  "footer": {
    "copyright": "版权所有 © {year} 我的应用",
    "language": "语言"
  }
}
```

创建 `src/i18n/locales/en-US/common.json` 对应的英文翻译。

## 应用集成

### 包装根组件

在 `src/App.jsx` 或入口文件包装应用：

```jsx
import React, { Suspense } from 'react';
import { I18nProvider } from 'i18n-maestro-react';
import i18n from './i18n';
import Router from './Router';

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <Suspense fallback={<div>Loading translations...</div>}>
        <Router />
      </Suspense>
    </I18nProvider>
  );
}

export default App;
```

### 基本使用

在组件中使用翻译：

```jsx
import React from 'react';
import { useTranslation } from 'i18n-maestro-react';

function HomePage() {
  // 使用翻译钩子
  const { t } = useTranslation();
  // 或指定命名空间
  // const { t } = useTranslation('home');
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('home.welcome', { name: 'John' })}</p>
      
      <div className="actions">
        <button>{t('actions.save')}</button>
        <button>{t('actions.cancel')}</button>
      </div>
    </div>
  );
}

export default HomePage;
```

### 处理 HTML 内容

使用 `Trans` 组件处理包含 HTML 的翻译：

```jsx
import React from 'react';
import { useTranslation, Trans } from 'i18n-maestro-react';
import { Link } from 'react-router-dom';

function TermsPage() {
  const { t } = useTranslation('legal');
  
  return (
    <div>
      <h1>{t('terms.title')}</h1>
      
      {/* 简单 HTML 内容 */}
      <Trans 
        i18nKey="terms.intro"
        values={{ company: 'MyApp Inc.' }}
      />
      
      {/* 含有 React 组件的复杂内容 */}
      <Trans
        i18nKey="terms.agreementText"
        components={{
          bold: <strong />,
          link: <Link to="/privacy" />
        }}
      />
    </div>
  );
}

// 在翻译文件中:
// "terms.intro": "欢迎使用<strong>{{company}}</strong>的服务。"
// "terms.agreementText": "使用本服务表示您同意我们的<bold>服务条款</bold>和<link>隐私政策</link>。"
```

### 语言切换

创建语言切换器组件：

```jsx
import React from 'react';
import { useTranslation } from 'i18n-maestro-react';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.getLanguage();
  const languages = {
    'zh-CN': '中文',
    'en-US': 'English'
  };
  
  const handleChange = (e) => {
    const newLang = e.target.value;
    i18n.setLanguage(newLang);
    
    // 可选：保存用户语言偏好
    localStorage.setItem('preferredLanguage', newLang);
  };
  
  return (
    <div className="language-switcher">
      <label htmlFor="language-select">{t('footer.language')}: </label>
      <select 
        id="language-select"
        value={currentLanguage} 
        onChange={handleChange}
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSwitcher;
```

### 日期和数字格式化

使用格式化工具：

```jsx
import React from 'react';
import { useTranslation } from 'i18n-maestro-react';

function ProductDetail({ product }) {
  const { t, i18n } = useTranslation('product');
  
  return (
    <div className="product">
      <h2>{product.name}</h2>
      <div className="price">
        {t('price')}: {i18n.formatCurrency(product.price, 'CNY')}
      </div>
      <div className="rating">
        {t('rating')}: {i18n.formatNumber(product.rating, { maximumFractionDigits: 1 })}
      </div>
      <div className="created">
        {t('createdAt')}: {i18n.formatDate(new Date(product.createdAt))}
      </div>
    </div>
  );
}
```

## 进阶使用

### 懒加载翻译

按路由懒加载翻译资源：

```jsx
import React, { useEffect } from 'react';
import { useTranslation } from 'i18n-maestro-react';

function AdminDashboard() {
  const { t, i18n } = useTranslation();
  
  // 组件加载时加载管理员相关翻译
  useEffect(() => {
    // 懒加载管理模块翻译
    i18n.loadNamespaces(['admin', 'reports']).then(() => {
      console.log('Admin translations loaded');
    });
  }, [i18n]);
  
  return (
    <div>
      <h1>{t('admin:dashboard.title')}</h1>
      {/* ... 仪表盘内容 ... */}
    </div>
  );
}
```

### 多语言 SEO

使用 React Helmet 处理多语言 SEO：

```jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'i18n-maestro-react';

function ProductPage({ product }) {
  const { t, i18n } = useTranslation('product');
  const currentLanguage = i18n.getLanguage();
  
  return (
    <>
      <Helmet>
        <html lang={currentLanguage} />
        <title>{t('product.pageTitle', { name: product.name })}</title>
        <meta name="description" content={t('product.metaDescription', { name: product.name })} />
        
        {/* 添加备用语言链接 */}
        {i18n.getLanguages().map(lang => (
          <link 
            key={lang}
            rel="alternate" 
            hrefLang={lang} 
            href={`https://myapp.com/${lang}/product/${product.id}`} 
          />
        ))}
      </Helmet>
      
      <div className="product-detail">
        {/* 产品内容 */}
      </div>
    </>
  );
}
```

### 复数形式处理

处理复数形式翻译：

```jsx
import React from 'react';
import { useTranslation } from 'i18n-maestro-react';

function NotificationCenter({ notifications }) {
  const { t } = useTranslation();
  const count = notifications.length;
  
  return (
    <div className="notifications">
      <h3>{t('notifications.title')}</h3>
      <div className="count">
        {t('notifications.count', { count })}
      </div>
      
      {/* 列表内容 */}
    </div>
  );
}

// 翻译文件中:
// "notifications.count": {
//   "zero": "没有新通知",
//   "one": "1条新通知",
//   "other": "{{count}}条新通知"
// }
```

### 使用钩子获取当前语言

监听语言变化：

```jsx
import React, { useEffect } from 'react';
import { useTranslation } from 'i18n-maestro-react';

function LanguageAwareComponent() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.getLanguage();
  
  useEffect(() => {
    // 语言变化时执行操作
    console.log(`Language changed to: ${currentLanguage}`);
    
    // 可以基于语言配置UI元素方向
    document.body.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // 或加载特定语言的资源
    if (currentLanguage === 'zh-CN') {
      // 加载中文特有资源
    }
  }, [currentLanguage]);
  
  return (
    <div className={`container lang-${currentLanguage}`}>
      {/* 组件内容 */}
    </div>
  );
}
```

### 高阶组件集成

使用高阶组件包装不具有翻译功能的组件：

```jsx
import React from 'react';
import { withTranslation } from 'i18n-maestro-react';

// 第三方组件，不支持i18n
function ExternalComponent({ title, description, onSave, t }) {
  return (
    <div>
      <h3>{title || t('component.defaultTitle')}</h3>
      <p>{description || t('component.defaultDescription')}</p>
      <button onClick={onSave}>{t('actions.save')}</button>
    </div>
  );
}

// 包装第三方组件
export default withTranslation()(ExternalComponent);

// 使用组件
function ParentComponent() {
  return <ExternalComponent />;  // 现在可以访问翻译函数
}
```

## 性能优化

### 记忆化翻译

避免不必要的重渲染：

```jsx
import React, { useMemo } from 'react';
import { useTranslation } from 'i18n-maestro-react';

function LargeList({ items }) {
  const { t } = useTranslation();
  
  // 记忆化常用翻译，避免每次渲染重新计算
  const translations = useMemo(() => ({
    noItems: t('list.noItems'),
    itemCount: t('list.count', { count: items.length }),
    statusLabels: {
      active: t('status.active'),
      pending: t('status.pending'),
      inactive: t('status.inactive')
    }
  }), [t, items.length]);
  
  return (
    <div>
      <h3>{translations.itemCount}</h3>
      
      {items.length === 0 ? (
        <p>{translations.noItems}</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>
              {item.name} - {translations.statusLabels[item.status]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 按需加载翻译

按路由懒加载翻译：

```jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'i18n-maestro-react';

// 主页组件
const Home = lazy(() => {
  // 同时加载组件和翻译
  return Promise.all([
    import('./pages/Home'),
    i18n.loadNamespaces(['home'])
  ]).then(([moduleExports]) => moduleExports);
});

// 设置组件
const Settings = lazy(() => {
  return Promise.all([
    import('./pages/Settings'),
    i18n.loadNamespaces(['settings'])
  ]).then(([moduleExports]) => moduleExports);
});

function App() {
  const { t } = useTranslation();
  
  return (
    <BrowserRouter>
      <Suspense fallback={<div>{t('app.loading')}</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

## 完整示例

下面是一个包含语言选择器和本地化内容的完整应用示例：

```jsx
import React, { useState, useEffect } from 'react';
import { I18nProvider, useTranslation, Trans } from 'i18n-maestro-react';
import i18n from './i18n';

// 语言选择器组件
function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <div className="language-switcher">
      <button onClick={() => i18n.setLanguage('zh-CN')}>中文</button>
      <button onClick={() => i18n.setLanguage('en-US')}>English</button>
    </div>
  );
}

// 主页内容
function HomePage() {
  const { t, i18n } = useTranslation();
  const [count, setCount] = useState(0);
  const currentLang = i18n.getLanguage();
  
  // 日期格式化示例
  const today = new Date();
  const formattedDate = i18n.formatDate(today);
  
  return (
    <div className="home-page">
      <h1>{t('app.name')}</h1>
      
      <p>
        <Trans
          i18nKey="home.welcome"
          values={{ name: 'Martin' }}
          components={{ bold: <strong /> }}
        />
      </p>
      
      <div className="counter">
        <p>{t('counter.value', { count })}</p>
        <button onClick={() => setCount(count + 1)}>
          {t('counter.increment')}
        </button>
      </div>
      
      <div className="date-example">
        <p>{t('today')}: {formattedDate}</p>
      </div>
      
      <footer>
        <p>
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
        <p>
          {t('footer.currentLanguage')}: {currentLang === 'zh-CN' ? '中文' : 'English'}
        </p>
      </footer>
    </div>
  );
}

// 应用组件
function App() {
  // 恢复用户语言偏好
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      i18n.setLanguage(savedLanguage);
    }
  }, []);
  
  return (
    <I18nProvider i18n={i18n}>
      <div className="app">
        <LanguageSwitcher />
        <HomePage />
      </div>
    </I18nProvider>
  );
}

export default App;
```

## 小结

本示例展示了如何在 React 应用中集成 i18n-maestro，包括基本设置、组件使用、语言切换和性能优化等方面。i18n-maestro 与 React 的集成非常顺畅，提供了强大而灵活的国际化能力，能够满足各种复杂的国际化需求。

更多高级功能和详细配置，请参考官方文档。