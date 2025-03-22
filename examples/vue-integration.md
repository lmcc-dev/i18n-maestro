# i18n-maestro Vue 集成示例

本文档展示如何在 Vue 应用中集成和使用 i18n-maestro，实现完整的国际化功能。

## 安装

```bash
# 安装核心库和Vue支持
npm install i18n-maestro i18n-maestro-vue

# 或使用 pnpm
pnpm add i18n-maestro i18n-maestro-vue
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
      escapeValue: false  // Vue 会自动处理转义
    }
  },
  vue: {
    globalInstall: true,  // 添加全局属性 $t 和 $i18n
    runtimeOnly: false,   // 支持编译时和运行时转换
    compositionAPI: true  // 启用组合式API支持
  }
}
```

### 创建 i18n 实例

新建 `src/i18n/index.js`:

```javascript
import { createI18n } from 'i18n-maestro';
import { createI18nVue } from 'i18n-maestro-vue';
import config from './i18n.config.js';

// 创建核心实例
const i18n = createI18n(config);

// 创建 Vue 插件
const i18nPlugin = createI18nVue(i18n);

export { i18n, i18nPlugin };
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

### 安装 Vue 插件

在 `src/main.js` 中安装插件:

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { i18nPlugin } from './i18n';

const app = createApp(App);

// 安装i18n插件
app.use(i18nPlugin);

app.mount('#app');
```

### 基本使用

#### 选项式 API

```vue
<template>
  <div class="home">
    <h1>{{ $t('app.name') }}</h1>
    <p>{{ $t('home.welcome', { name: username }) }}</p>
    
    <div class="actions">
      <button>{{ $t('actions.save') }}</button>
      <button>{{ $t('actions.cancel') }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      username: 'Martin'
    };
  },
  mounted() {
    // 获取当前语言
    console.log(this.$i18n.getLanguage());
    
    // 使用当前实例获取翻译
    const message = this.$t('home.message');
    console.log(message);
  }
};
</script>
```

#### 组合式 API

```vue
<template>
  <div class="home">
    <h1>{{ t('app.name') }}</h1>
    <p>{{ t('home.welcome', { name: username }) }}</p>
    
    <div class="actions">
      <button>{{ t('actions.save') }}</button>
      <button>{{ t('actions.cancel') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'i18n-maestro-vue';

// 使用组合式API获取翻译功能
const { t, i18n } = useI18n();
// 或指定命名空间: const { t } = useI18n('home');

const username = ref('Martin');

// 获取当前语言
const currentLanguage = i18n.getLanguage();
console.log(`Current language: ${currentLanguage}`);
</script>
```

### 语言切换

创建语言切换器组件：

```vue
<template>
  <div class="language-switcher">
    <label for="language-select">{{ t('footer.language') }}: </label>
    <select 
      id="language-select"
      v-model="currentLanguage" 
      @change="changeLanguage"
    >
      <option 
        v-for="(name, code) in languages" 
        :key="code" 
        :value="code"
      >
        {{ name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'i18n-maestro-vue';

const { t, i18n } = useI18n();
const currentLanguage = ref(i18n.getLanguage());
const languages = {
  'zh-CN': '中文',
  'en-US': 'English'
};

function changeLanguage() {
  i18n.setLanguage(currentLanguage.value);
  // 可选：保存用户语言偏好
  localStorage.setItem('preferredLanguage', currentLanguage.value);
}

// 监听外部语言变更
watch(() => i18n.getLanguage(), (newLang) => {
  currentLanguage.value = newLang;
});
</script>
```

### 处理 HTML 内容

使用 `i18n-t` 组件处理包含 HTML 的翻译：

```vue
<template>
  <div class="terms">
    <h1>{{ t('terms.title') }}</h1>
    
    <!-- 简单HTML内容 -->
    <i18n-t 
      keypath="terms.intro"
      :values="{ company: 'MyApp Inc.' }"
      tag="div"
    />
    
    <!-- 含有Vue组件的复杂内容 -->
    <i18n-t 
      keypath="terms.agreementText"
      tag="p"
    >
      <template #bold="{ chunks }">
        <strong>{{ chunks }}</strong>
      </template>
      <template #link="{ chunks }">
        <router-link to="/privacy">{{ chunks }}</router-link>
      </template>
    </i18n-t>
  </div>
</template>

<script setup>
import { useI18n } from 'i18n-maestro-vue';
const { t } = useI18n('legal');
</script>

<!-- 在翻译文件中: -->
<!-- "terms.intro": "欢迎使用<strong>{{company}}</strong>的服务。" -->
<!-- "terms.agreementText": "使用本服务表示您同意我们的<bold>服务条款</bold>和<link>隐私政策</link>。" -->
```

### 日期和数字格式化

使用格式化工具：

```vue
<template>
  <div class="product">
    <h2>{{ product.name }}</h2>
    <div class="price">
      {{ t('price') }}: {{ formatCurrency(product.price, 'CNY') }}
    </div>
    <div class="rating">
      {{ t('rating') }}: {{ formatNumber(product.rating, { maximumFractionDigits: 1 }) }}
    </div>
    <div class="created">
      {{ t('createdAt') }}: {{ formatDate(product.createdAt) }}
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'i18n-maestro-vue';

const { t, formatCurrency, formatNumber, formatDate } = useI18n('product');

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});
</script>
```

### 全局组件和指令

i18n-maestro-vue 会自动注册一些全局组件和指令：

```vue
<template>
  <div class="app">
    <!-- 全局组件 i18n-t -->
    <i18n-t keypath="welcome.message" tag="h1" />
    
    <!-- v-t 指令 -->
    <p v-t="'common.description'"></p>
    
    <!-- 带参数的v-t指令 -->
    <p v-t="{ path: 'greeting', args: { name: username } }"></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const username = ref('Martin');
</script>
```

## 进阶使用

### 懒加载翻译

按路由懒加载翻译：

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { i18n } from '../i18n';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    // 路由元数据中定义需要的翻译命名空间
    meta: {
      namespaces: ['home']
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: {
      namespaces: ['admin', 'reports']
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫中加载翻译
router.beforeEach(async (to, from, next) => {
  // 如果路由定义了翻译命名空间
  if (to.meta.namespaces) {
    try {
      // 加载所需命名空间
      await i18n.loadNamespaces(to.meta.namespaces);
      next();
    } catch (error) {
      console.error('Failed to load translations:', error);
      next();
    }
  } else {
    next();
  }
});

export default router;
```

### 多语言 SEO

使用 `vue-meta` 处理多语言 SEO：

```vue
<template>
  <div class="product-detail">
    <!-- 产品内容 -->
  </div>
</template>

<script>
import { useI18n } from 'i18n-maestro-vue';
import { useMeta } from 'vue-meta';

export default {
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { t, i18n } = useI18n('product');
    const currentLanguage = i18n.getLanguage();
    
    // 设置页面元数据
    useMeta({
      htmlAttrs: {
        lang: currentLanguage
      },
      title: t('product.pageTitle', { name: props.product.name }),
      meta: [
        {
          name: 'description',
          content: t('product.metaDescription', { name: props.product.name })
        }
      ],
      link: i18n.getLanguages().map(lang => ({
        rel: 'alternate',
        hrefLang: lang,
        href: `https://myapp.com/${lang}/product/${props.product.id}`
      }))
    });
    
    return { t };
  }
};
</script>
```

### 复数形式处理

处理复数形式翻译：

```vue
<template>
  <div class="notifications">
    <h3>{{ t('notifications.title') }}</h3>
    <div class="count">
      {{ t('notifications.count', { count }) }}
    </div>
    
    <!-- 列表内容 -->
    <ul v-if="count > 0">
      <li v-for="notification in notifications" :key="notification.id">
        {{ notification.message }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'i18n-maestro-vue';

const { t } = useI18n();

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
});

const count = computed(() => props.notifications.length);
</script>

<!-- 翻译文件中: -->
<!-- "notifications.count": {
  "zero": "没有新通知",
  "one": "1条新通知",
  "other": "{{count}}条新通知"
} -->
```

### 自定义指令

创建自定义的翻译相关指令：

```javascript
// src/directives/i18n-directives.js
import { i18n } from '../i18n';

// 创建日期格式化指令
export const vDate = {
  mounted(el, binding) {
    const value = binding.value;
    const options = binding.arg || {};
    
    if (value) {
      const date = new Date(value);
      el.innerText = i18n.formatDate(date, options);
    }
  },
  updated(el, binding) {
    const value = binding.value;
    const options = binding.arg || {};
    
    if (value) {
      const date = new Date(value);
      el.innerText = i18n.formatDate(date, options);
    }
  }
};

// 创建货币格式化指令
export const vCurrency = {
  mounted(el, binding) {
    const value = binding.value;
    const currency = binding.arg || 'CNY';
    const options = binding.modifiers || {};
    
    if (value !== undefined) {
      el.innerText = i18n.formatCurrency(value, currency, options);
    }
  },
  updated(el, binding) {
    const value = binding.value;
    const currency = binding.arg || 'CNY';
    const options = binding.modifiers || {};
    
    if (value !== undefined) {
      el.innerText = i18n.formatCurrency(value, currency, options);
    }
  }
};

// 注册指令
export function registerI18nDirectives(app) {
  app.directive('date', vDate);
  app.directive('currency', vCurrency);
}
```

使用自定义指令：

```vue
<template>
  <div class="product">
    <!-- 日期格式化指令 -->
    <div class="created">
      {{ t('createdAt') }}: <span v-date="product.createdAt"></span>
    </div>
    
    <!-- 货币格式化指令 -->
    <div class="price">
      {{ t('price') }}: <span v-currency:CNY="product.price"></span>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'i18n-maestro-vue';
const { t } = useI18n('product');

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});
</script>
```

### 使用 Pinia 实现状态管理

通过 Pinia 管理语言和翻译状态：

```javascript
// src/stores/i18n.js
import { defineStore } from 'pinia';
import { i18n } from '../i18n';

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    currentLanguage: i18n.getLanguage(),
    availableLanguages: i18n.getLanguages(),
    loadedNamespaces: [],
    loading: false
  }),
  
  getters: {
    isLanguageLoaded: (state) => (lang) => {
      return i18n.hasLanguage(lang);
    },
    isNamespaceLoaded: (state) => (ns) => {
      return state.loadedNamespaces.includes(ns);
    }
  },
  
  actions: {
    async changeLanguage(lang) {
      this.loading = true;
      try {
        await i18n.setLanguage(lang);
        this.currentLanguage = lang;
        // 保存用户偏好
        localStorage.setItem('preferredLanguage', lang);
      } catch (error) {
        console.error('Failed to change language:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async loadNamespace(namespace) {
      if (this.loadedNamespaces.includes(namespace)) {
        return;
      }
      
      this.loading = true;
      try {
        await i18n.loadNamespaces([namespace]);
        this.loadedNamespaces.push(namespace);
      } catch (error) {
        console.error(`Failed to load namespace ${namespace}:`, error);
      } finally {
        this.loading = false;
      }
    }
  }
});
```

在组件中使用：

```vue
<template>
  <div class="language-controls">
    <div v-if="i18nStore.loading" class="loader">
      {{ t('app.loading') }}
    </div>
    
    <select 
      v-model="selectedLanguage" 
      @change="changeLanguage"
      :disabled="i18nStore.loading"
    >
      <option 
        v-for="lang in i18nStore.availableLanguages" 
        :key="lang" 
        :value="lang"
      >
        {{ languageNames[lang] }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'i18n-maestro-vue';
import { useI18nStore } from '../stores/i18n';

const { t } = useI18n();
const i18nStore = useI18nStore();

const selectedLanguage = ref(i18nStore.currentLanguage);

const languageNames = {
  'zh-CN': '中文',
  'en-US': 'English',
  'ja-JP': '日本語'
};

async function changeLanguage() {
  await i18nStore.changeLanguage(selectedLanguage.value);
}

// 按需加载管理模块翻译
if (isAdmin.value && !i18nStore.isNamespaceLoaded('admin')) {
  i18nStore.loadNamespace('admin');
}
</script>
```

## 完整示例

下面是一个包含语言选择器和本地化内容的完整应用示例：

```vue
<template>
  <div class="app">
    <!-- 顶部导航 -->
    <header>
      <h1>{{ t('app.name') }}</h1>
      <nav>
        <router-link to="/">{{ t('nav.home') }}</router-link>
        <router-link to="/settings">{{ t('nav.settings') }}</router-link>
      </nav>
      <LanguageSwitcher />
    </header>
    
    <!-- 主内容 -->
    <main>
      <h2>{{ t('home.title') }}</h2>
      
      <p>
        <i18n-t keypath="home.welcome" :values="{ name: username }">
          <template #bold="{ chunks }">
            <strong>{{ chunks }}</strong>
          </template>
        </i18n-t>
      </p>
      
      <!-- 计数器示例 -->
      <div class="counter">
        <p>{{ t('counter.value', { count }) }}</p>
        <button @click="incrementCount">
          {{ t('counter.increment') }}
        </button>
      </div>
      
      <!-- 日期示例 -->
      <div class="date-example">
        <p>{{ t('today') }}: <span v-date="today"></span></p>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer>
      <p v-t="{ path: 'footer.copyright', args: { year: currentYear } }"></p>
      <p>{{ t('footer.currentLanguage') }}: {{ currentLanguageDisplay }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'i18n-maestro-vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';

// 使用i18n功能
const { t, i18n } = useI18n();

// 状态
const username = ref('Martin');
const count = ref(0);
const today = new Date();

// 计算属性
const currentYear = computed(() => new Date().getFullYear());
const currentLanguageDisplay = computed(() => {
  const lang = i18n.getLanguage();
  return lang === 'zh-CN' ? '中文' : 'English';
});

// 方法
function incrementCount() {
  count.value++;
}

// 生命周期钩子
onMounted(() => {
  // 恢复用户语言偏好
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage && i18n.hasLanguage(savedLanguage)) {
    i18n.setLanguage(savedLanguage);
  }
});
</script>

<style scoped>
.app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

nav {
  display: flex;
  gap: 20px;
}

.counter {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

footer {
  margin-top: 50px;
  border-top: 1px solid #eee;
  padding-top: 20px;
  color: #666;
}

/* 根据语言调整方向 */
html[lang="ar"] .app {
  direction: rtl;
}
</style>
```

## 小结

本示例展示了如何在 Vue 应用中集成 i18n-maestro，包括基本设置、组件使用、语言切换和性能优化等方面。i18n-maestro 与 Vue 的集成非常顺畅，提供了强大而灵活的国际化能力，能够满足各种复杂的国际化需求。

通过结合 Vue 的强大功能，如组合式 API、自定义指令和 Pinia 状态管理，可以构建出高效且用户友好的多语言应用。

更多高级功能和详细配置，请参考官方文档。