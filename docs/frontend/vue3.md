---
outline: deep
---
<script setup>
import { VTCodeGroup, VTCodeGroupTab } from '../.vitepress/components'
</script>

# 创建依赖库 <Badge type="tip" text="vue3" /><Badge type="warning" text="alpha" />

## create-lcap-extension

执行 `npm create lcap-extension@alpha` 命令初始化依赖库目录

``` bash
npm create lcap-extension@alpha

输入依赖库名称
选择依赖库模板
  * vue3

```


## 安装依赖

在依赖库项目初始化完成后，根据提示，跳转工作路径，进入刚才生成的依赖库文件安装依赖。

跳转工作路径，`*` 为泛指，配置时更换为依赖库名称即可。命令如下所示：

```bash
cd *
```

安装依赖。命令如下所示：

<VTCodeGroup>
  <VTCodeGroupTab label="npm">

  ```sh
  $ npm install --legacy-peer-deps
  ```

  </VTCodeGroupTab>
  <VTCodeGroupTab label="pnpm">

  ```sh
  $ pnpm i
  ```

  </VTCodeGroupTab>
  <VTCodeGroupTab label="yarn">

  ```sh
  $ yarn
  ```

  </VTCodeGroupTab>
</VTCodeGroup>

## 目录结构

<VTCodeGroup>
  <VTCodeGroupTab label="Vue3">

  ```
  library_example
  |-- .storybook                      # storybook 配置
  |-- dist-theme                      # 构建生成目录
  |-- src                             # 工程源码目录
  |---- components                    # 扩展组件
  |---- logics                        # logics 逻辑目录
  |---- index.ts                      # 打包入口文件
  |-- ...                             # 其他配置文件，例如 .editor.config, postcss 等
  |-- package.json
  |-- tsconfig.api.json               # api.ts 编译配置
  |-- tsconfig.json                   # 项目 typescript 配置
  |-- vite.config.mjs                  # vite 构建配置
  ```

  </VTCodeGroupTab>
</VTCodeGroup>

## 创建组件

执行 `npm run create` 命令生成组件目录文件。

执行 `npm run create` 命令时，可选择创建组件或者逻辑，默认选择为创建组件。如下：

![](/images/create-component.png)

创建组件时，需要设置组件名称（组件使⽤大驼峰的格式命名，如CapsuleSelect），组件别名以及组件的适用终端，默认选择为PC端。如下：

![](/images/create-component1.png)

## 本地开发启动

```sh
$ npm run dev
```
![](/images/dev.png)
![](/images/dev1.png)

## 本地开发调试

执行 `npm run dev`  开启本地组件开发调试，此项目使用 `storybook` + `vite` 作为基础工程模式

- 如何写组件调试 demo, 请查看文档 [How to write stories • Storybook docs](https://storybook.js.org/docs/writing-stories)
- 关于如何修改工程构建配置，请查看文档 [vite 官网](https://vitejs.dev/)
