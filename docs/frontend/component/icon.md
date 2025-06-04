---
outline: deep
---

# 自定义组件面板图标

## 1. 功能说明

自定义在IDE右侧组件列表中展示的组件图标。

<img src="../../images/tubiao_202411211545_1.png" class="imgStyle" style="" />

## 2. 功能实现

1.  在项目文件根目录下创建文件夹 assets ，在文件夹下添加.svg格式图标文件。

    <img src="../../images/tubiao_202411211545_2.png" class="imgStyle" style="width:400px" />

1.  在组件的 api.ts 文件中，通过 @Component 装饰器定义图标 icon 。icon对应的文件支持根据 assets 匹配路径。

    ```typescript
    @Component({
        icon: 'demo.svg',
    })
    ```

    <img src="../../images/tubiao_202411211545_3.png" class="imgStyle" style="" />