---
outline: deep
---

# 依赖库按需加载 <Badge type="tip" text="^4.1.0" /> <Badge type="tip" text="lcap^0.6.0" /> <Badge type="tip" text="vue3" />

> 该功能仅在 `vue3` 环境中支持, `IDE >= 4.1.0` `lcap >= 0.6.0`, 项目中 `@lcap/builder >= 1.6.0`

在偏好设置中开启 `依赖库按需加载`

![](/images/treeshake-set.png){data-zoomable}

## 依赖库的使用

默认情况下，安装依赖库会使用 Vue 插件的方式安装，例如:

```ts
import { createApp } from 'vue';
import App from './App.vue';
import CwTdCalender from 'cw_td_calendar';

const app = createApp(App);

app.use(CwTdCalender); // 安装依赖库中的所有组件
```

这种情况下，无论依赖库的中的组件是否有被使用到，都会被打包到应用中，导致应用的js 体积变大，页面访问变慢；

开启依赖库按需加载，仅在组件被使用时，才会 `import` 相应的组件代码；

```html
<template>
<v-calendar />
</template>
<script setup>
import { CwTdCalender as VCalendar } from 'cw_td_calendar';

// ...
<script>
```

若依赖库支持按需加载, 会根据依赖库产物中的 `es/module.json` 最小化构建应用代码；

## 依赖库支持按需加载

> `@lcap/builder >= 1.6.0` 支持该功能；

修改 `vite.config.mjs` 中的 `lcapPlugin` 配置增加 `modules`，开启模块化构建

```js
// ...
lcapPlugin({
  type: 'extension',
  framework: 'vue3',
  modules: {}, // 开启模块化构建
}),
// ...
```

执行 `npm run build` 后，会生成 `es` 目录

```
|-- es
|---- components               // 每个组件单独打包产物
|------- CwTdCalendar
|----------- index.mjs
|---- modules.json             // 依赖库中所有的export 信息
```

**es/modules.json**

```json
{
  "exports": {
    "CwTdCalendar": {
      "src": "components/cw-td-calendar/index",
      "isDefault": true
    }
  },
  "api": {
    "CwTdCalendar": "src/components/cw-td-calendar/api.ts"
  }
}
```

> 注意：应用开启依赖库按需加载后，不再调用 `install` 函数，应不要在 Vue 全局注册依赖库组件/指令

例如： 组件中依赖库 `element-plus` 组件的 `el-button` 组件

以下是错误示范：

```html
<template>
  <el-button>Hello</el-button>
</template>
<script setup>
// ...
</script>
```

**src/index.ts**

```ts
import ElementPlus from 'element-plus';

// ...

export const install = (app) => {
  app.use(ElementPlus);
  // ...
}
```

应移除全局的组件安装，使用时 `import` 响应的依赖

**index.vue**

```html
<template>
  <el-button>Hello</el-button>
</template>
<script setup>
import { ElButton } from 'element-plus';
// ...
</script>
```


**src/index.ts**

```ts
// ...

export const install = (app) => {
  // app.use(ElementPlus); 移除全局安装
  // ...
}
```
