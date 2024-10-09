---
outline: deep
---

# 基础组件二次开发常见问题解答

## npm install 后未生成 .lcap 目录如何处理？

手动执行 `lcap install` 来安装平台组件包， 如果 `lcap install` 执行失败，则需要检查配置的平台地址是否可以正常访问与本地是否开启 `http` 代理， 关闭代理即可安装。

## lcap create 选择 fork 后，本地开发或构建报错？

第一次 `fork` 组件会更新 `package.json` 需要重新安装包 `npm install`。

## 表单项、表格列等子组件是否支持二次开发？

子组件支持二次开发，但鉴于子组件和父组件之间的关联关系，二次开发子组件时需要注意以下几点问题：

* 父组件中可能存在对子组件的识别的判断，如果对子组件进行二次开发后使得父组件原本用于识别子组件的判断条件不再满足，相关功能将会失效；
* `Vue` 子组件中可能存在 `this.$parent` 获取父组件实例方式，如果对子组件进行二次开发后使得子组件无法正确找到父组件实例，封装子组件会出现异常。

通常情况下，二次开发组件可以直接修改原生依赖或通过 `fork` 模式来实现；但在二次开发子组件时，为了避免子组件和父组件的关系存在以上情况，推荐通过 `fork` 模式来实现，并且在 `fork` 模式下检查源码存在以上情况时需要对源码进行修改。

`fork` 模式下，会复制基础组件全部代码，但 `api.ts` 中只会保留父组件的代码并另外生成一个 `temp-all-api.bak` 文件来存储全部的组件 api 描述代码，请根据需要二次开发子组件，复制到 `api.ts` 中，并将与父组件存在关联关系的子组件替换为新的子组件。

以二次开发 `UTableView(表格)` 与 `UTableViewColumn(表格列)` 为例：

1. 从 `temp-all-api.ts` 复制 `UTableViewColumn` 和 `UTableViewColumnOptions` 的代码到 `api.ts` 。

2. 修改 `components/index.ts` 导出 `UTableViewColumn` 文件。
  ```ts
  // ...
  import ExUTableView, { UTableViewColumn as ExUTableViewColumn } from './ex-u-table-view';
  export {
      // ...
    ExUTableView,
    ExUTableViewColumn,
  };
  ```

3. 修改 `block.stories.js` 和 `api.ts` 中的 `@Slot.snippets` 配置，将 `u-table-view-column` 替换为 `ex-u-table-view-column`。

4. 扫描组件源码中是否有根据 `tag === ‘u-table-view-column’` 判断的代码，修改为 `ex-u-table-view-column`。

## 基于自己开发的组件，如何替换基础组件？

在 `api.ts` 中 `@ExtensionComponent` 装饰器，增加 `replaceNaslUIComponent` 即可；

```ts
@ExtensionComponent({
  replaceNaslUIComponent: 'UButton', // 替换掉组件名称
})
```
