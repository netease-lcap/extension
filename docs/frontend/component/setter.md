---
outline: deep
---

# 自定义 Setter  <Badge type="tip" text="^4.0.0" /> <Badge type="tip" text="lcap^0.6.0" />

## 初始化setter 目录

在项目根目录下执行以下命令，初始化setter目录

```sh
lcap init --setter
```

执行成功后会在根目录下生成 `setters` 文件夹 (`setters` 下需要单独执行 `npm install` 安装包)

![](/images/setter1.png)

## 修改 `vite.config` 构建配置

```ts
// ...
lcapPlugin({
  type: 'extension',
  framework: 'vue2',
  // 新增setters 配置
  ide: {
    setters: {
      rootPath: 'setters', // setters 项目路径
      // 每个setter 文件单独打包
      entries: {
        ExInputSetter: 'src/setters/ExInputSetter.vue',
      },
    }
  }
}),
//...
```

执行 `npm run build` 命令，会在 `dist-theme` 目录下生成 `setters` 文件夹与 `setters.json` 文件

![](/images/setter2.png)

## 使用自定义setter

在 `api.ts` 中使用自定义setter

```ts
//...

@Prop({
  //...
  concept: 'CustomSetter', // 固定名称
  name: 'ExInputSetter', // 自定义组件的名称 配置再entries下的key
})
//...
```
