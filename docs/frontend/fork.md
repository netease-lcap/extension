---
outline: deep
---

# 私有化部署fork 组件库开发方案

## 说明

此文档用户私有化客户，仅针对 [CodeWave](https://codewave.163.com/) 私有化部署客户基于官方组件库定制化UI组件库的需求提供，其他扩展组件功能的需求，请参考 [官方前端扩展文档](../frontend/introduction.md)。

## 环境准备

### 安装 node & pnpm

node 需要 `v18.17.0`  以上版本， 组件仓库 `pnpm`  管理包，建议版本 `> v8.0.0` 

```jsx
npm install -g pnpm@latest
```

### 确认平台版本

在平台 → 应用中心页面中可看到ide版本

![image.png](/images/fork1.png)

### 下载代码仓库到本地

代码仓库地址： [https://github.com/netease-lcap/ui-libraries](https://github.com/netease-lcap/ui-libraries) ， 使用 git 命令或者选择对应的分支直接下载 .zip 包到本地

```jsx
git clone https://github.com/netease-lcap/ui-libraries.git
```

![image.png](/images/fork2.png)

通过平台版本切换到对应分支，例如：

```
平台版本         git分支名称
3.8             release/v3.8.2
3.9             release/v3.9.0
3.10            release/v3.10.0
3.11            release/v3.11.0
3.12            release/v3.12.0
3.13            release/v3.13.0
```

切换到对应分支之后，执行 `pnpm i`  安装包；

## 本地开发

### 仓库目录介绍

```
|-- lcap-ui
|---- libraries                         // ui 库
|------ pc-ui                           // PC 端 UI 库（Vue2.6 CloudUI）
|------ mobile-ui                       // Mobile 端 UI 库（Vue2.6 vant）
|------ pc-react-ui                     // PC 端 UI 库（React AntD）
|---- packages                          // 其他工具库
|------ builder                         // 工程命令相关库
|------ validator                       // 表单验证库
|------ vue2-utils                      // vue 工具库
|------ ...                             // 其他公共依赖
|------ package.json                    // 项目文件，跟随 ide 版本，
```

### 组件目录介绍

```markdown
|-- pc-ui
|-- .storybook                       // storybook 配置
|---- main.js
|---- preview.js
|-- src
|---- components                     // 组件目录
|------- u-button
|---------- stories
|------------- block.stories.js                      // 代码区块示例
|------------- examples.stories.js                     // 组件开发调试demo
|----------- tests
|------------- fixes                                 // 修复bug时的单测代码
|------------- features                              // 有功能增加时每个功能新增单测
|------------- Button.test.ts                        // 组件测试代码
|----------- screenshot                              // 区块示例截图
|----------- drawings                                // 区块示例截图
|----------- api.ts                                  // 组件描述文件
|----------- index.vue                               // 组件文件
|----------- index.jsx                               // 组件导出文件
|-------- // 其他组件
|------ index.ts                       // 打包入口文件
|-- test                             // 测试代码
|---- coverage                       // 单测覆盖率文件（不提交）
|---- setup.js                       // 单元测试启动文件
|-- lcap-ui.config.js                // 组件打包配置 （向IDE 输出组件配置）
|-- package.json                     // 组件库项目文件 名称 @lcap/pc-ui
|-- vite.config.js                   // vite 开发、构建、测试 配置文件
|-- tsconfig.json                    // Typescript 配置文件
|-- tsconfig.api.json                // api.ts 编译配置文件
```

### 本地开发模式

执行 `npm run dev`  开启本地组件开发调试，此项目使用 `storybook` + `vite` 作为基础工程模式

- 如何写组件调试 demo, 请查看文档 [How to write stories • Storybook docs](https://storybook.js.org/docs/writing-stories)
- 关于如何修改工程构建配置，请查看文档 [vite 官网](https://vitejs.dev/)

关于 codewave ide 如何对接组件，请查看 [组件接入指南](../frontend/component/index.md#接入说明) 文档；

## IDE 联调

构建资源 & 启动本地服务器

```
npm run build && npx live-server --cors
```

chrome [代理](https://chromewebstore.google.com/detail/xswitch/idkjhjggpffolpidfkikidcokdkdaogg?hl=zh-CN&utm_source=ext_sidebar)资源到本地

```markdown

{
  // Use IntelliSense to learn about possible links.
  // Type `rule` to quick insert rule.
  // 输入 rule 来快速插入规则
  // For more information, visit: https://github.com/yize/xswitch
  "proxy": [
    [
      "[Platform_URL]/lowcode-static/packages/@lcap/pc-ui@[version]/",
      "http://localhost:8080/"
    ],
  ],
}
```

- `[Platform_URL]` 替换为平台地址, 例如 `https://xxx.163yun.com`
- `[version]`替换为组件库 `package.json` 中的版本号， 例如： `1.0.0`
- 后面更改了文件需要手动执行 `npm run build`  然后刷新页面即可;

## 发布部署

1. 安装 `lcap` 工具

```bash
npm install -g lcap@latest
```

1. 在组件库目录下创建 `.lcaprc` 文件

```
|- pc-ui
|--- //....
|--- .lcaprc
```

```
{
  "platform": "http://xxx.codewave.163.com/",
  "username": "xxx",
  "password": "xxxxx"
}
```

- `platform` 平台地址
- `username` 登录账号
- `password` 登录密码
1. 在组件目路执行命令发布

```sh
npm run build # 构建

npx lcap-scripts deploy # 推送资源
```

风险：

- 每次平台进行更新后都需要再次发布来覆盖平台的资源更新；
- 无法同步平台组件库的新增功能；

## 自定义基础组件图标 <Badge type="tip" text="^3.13.0" />

### 功能说明

自定义在IDE右侧组件列表中展示的组件图标。

![](/images/component-panel-icon.png){data-zoomable}

### 实现步骤

1. 在项目文件根目录下创建文件夹 `assets` ，在文件夹下添加 `.svg` 格式图标文件。

![](/images/file-icon1.png){width=300px}

2. `api.ts` 中，通过 `@Component` 装饰器定义图标 `icon`，`icon` 对应的文件支持根据 `assets` 匹配路径。

```typescript
@Component({
  // ...
  icon: 'demo.svg',
})
```

### 发布图片资源

```sh
npm run build # 构建

npx lcap-scripts deploy --images
```

## 相关链接

* [pnpm](https://pnpm.io/zh)
* [vite](https://vitejs.dev/)
* [vitest](https://cn.vitest.dev/guide/)
* [storybook](https://storybook.js.org/docs/get-started/install)
