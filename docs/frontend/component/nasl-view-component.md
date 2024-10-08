---
outline: deep
---

# View Component API 书写指南和规范

## 介绍
### 1.1 背景
CodeWave 智能开发平台可以集成多种不同的前端技术栈（包括 Vue2、React 等），为了解耦 IDE 与多种技术栈的衔接以及页面组件的具体实现，让用户在 IDE 中使用时有统一的页面编辑、灵活的属性样式配置、精确的类型检查和智能自然语言生成 UI 等高级体验，让专业开发利用脚手架工具能够高效地生产物料，在此声明本规范。

### 1.2 定义

用于描述一组页面组件的 API 的书写规范，目前要求使用 TypeScript 的 class 和 decorator 方式书写。

> 说明：目前用 TypeScript 书写，而不用 JSON/YAML，主要有以下几点原因：
>
> * 类型推导（特别是泛型相关）在不用 TypeScript 的情况下书写困难
> * 配置参数在不用 TypeScript 的情况下检查粒度较粗，在 IDE 中容易出问题参考 [vue-facing-decorator](https://github.com/facing-dev/vue-facing-decorator)、[vue-property-decorator](https://github.com/kaorun343/vue-property-decorator) 以及 React class component 的书写方式。

### 1.3 适合范围

适用于基础组件库，和扩展依赖库 lcap 脚手架工具的页面组件部分。


## 2. 指南

### 2.1 准备

* 文件名建议为 `api.ts`

> 注意：decorator 无法在 `d.ts` 声明文件中使用。

* 安装 npm 包：`@nasl/types`

### 2.2 基本概念

在书写 API 之前，需要先了解以下概念：

* **组件声明**（ViewComponent）：在 CodeWave 中，低代码的组件可通过引用访问属性和方法（这部分的作用域与属性和事件绑定不完全一样，因此分成了两个类）
  * **可访问属性：** 在 IDE 中类似这样的方式 `$refs.tableView.data` 来访问。
  ![](/images/api-read-prop.png)
  * **方法：** 在 IDE 中类似这样的方式 $refs.tableView.exportExcel(page, size, ...)来使用
  ![](/images/api-method.png)


* **组件选项**（ViewComponentOptions）：
![](/images/api-prop.png)
  * **属性：** 在 IDE 中的右侧属性面板绑定表达式来使用
    * **静态绑定：** 在属性面板中的默认交互形态，比如开关、输入框等
    ![](/images/api-prop-static.png)
    * **动态绑定：** 点击“动态绑定”图标后切换到的形态，可以绑定一个 NASL 表达式
    ![](/images/api-prop-dynamic.png)
    * **双向绑定：** 语法糖，同 Vue 的双向绑定
    ![](/images/api-prop-multi.png)

  * **事件：** 在 IDE 中的右侧事件面板添加事件逻辑来使用
  ![](/images/api-event.png)
    * **event 事件对象：** 要求有且只有一个事件对象，不需要传参时类型可设置为 null
    ![](/images/api-event-obj.png)

  * **插槽：** 在 IDE 中的页面设计器中可插入子组件或其他组件
  ![](/images/api-slot.png)
  
    * **current 插槽参数对象：** 要求没有或者只有一个插槽参数对象，不需要传参时不设置参数
    ![](/images/api-slot-current.png)

    * **snippets 代码片段：** 插槽代码片段列表
    ![](/images/api-slot-snippet.png)

  * **子组件：** 声明内容基本同组件，用于配置主要组件使用，在 IDE 的组件面板中不直接显示。
  ![](/images/api-child.png)

### 2.3 大致结构
文件大致结构如下（中文部分需要替换成真实内容）：

```typescript
/// <reference types="@nasl/types" />

// 基础组件 nasl.ui 依赖库扩展组件 extension.xxx.viewComponents
namespace nasl.ui {
    @Component({
        title: '组件标题',
        description: '组件描述',
        ...
    })
    export class 组件名<泛型参数，可选> extends ViewComponent {
        @Prop({
            title: '可访问属性标题',
        })
        可访问属性名: 类型;

    @Method({
            title: '方法标题',
            description: '方法描述',
        })
        方法名(参数1, 参数2, ...): 返回类型 { /* 不用实现 */ }

    constructor(options?: Partial<组件名Options<泛型参数，可选>>) { super(); }
    }

    export class 组件名Options<泛型参数，可选> extends ViewComponentOptions {
        @Prop({
            title: '属性标题',
            ...
        })
        属性名: 类型 = 默认值;

        @Prop({
            title: '属性标题',
            ...
        })
        private 属性名: 类型; /* private 表示暂时不对用户开放 */

      @Event({
            title: '事件标题',
            description: '事件描述',
        })
        on事件名: (event: 事件对象类型) => void; /* 一般以 on 开头，固定一个 event 对象参数 */

      @Slot({
            title: '插槽标题',
            description: '插槽描述',
            snippets: [ // 快捷添加代码片段
                {
                    title: '代码片段标题',
                    code: '代码片段内容',
                }
            ],
        })
        slot插槽名: (插槽参数, 可选) => Array<可插入的组件1 | 可插入的组件2 | 可插入的组件3>; /* 插槽返回类型规定了可插入哪些子组件或其他组件 */
    }

    @Component({
        title: '子组件标题',
        description: '子组件描述',
        ...
    })
    export class 子组件名<泛型参数，可选> extends ViewComponent { ... }

    export class 子组件名Options<泛型参数，可选> extends ViewComponentOptions { ... }

    ...
}
```

基础配置参数可查阅下文中的规范部分，这里不再详述。

### 2.4 NASL 类型
为了能够顺利集成到 NASL 的类型系统中，@nasl/types包给 TypeScript 的传统类型起了别名。类型声明请使用以下写法：

#### a. 基础类型

```typescript
nasl.core.Boolean // 相当于 boolean
nasl.core.Integer // 相当于 number
nasl.core.Decimal // 相当于 number
nasl.core.String // 相当于 string
nasl.core.Date // 相当于 Date
nasl.core.DateTime // 相当于 Date
```

#### b. 集合类型

```typescript
nasl.collection.List `<T>` // 相当于 Array `<T>`
nasl.collection.Map<K, V> // 相当于 Record<K, V>
```

#### c. 匿名数据结构（对应 TS 的 object 类型）

```typescript
{ list: nasl.collection.List<T>, total: nasl.core.Integer }
```

#### d. Union 类型

```typescript
nasl.core.Boolean | nasl.core.String
nasl.collection.List<T> | { list: nasl.collection.List <T>, total: nasl.core.Integer }
```

#### e. 其他

在属性、方法和事件的类型声明处不要使用 any，在 decorator 中可以使用 any。

### 2.5 组件属性和可访问属性的配置要点
#### a. 默认值

组件属性在标注类型后，可以用赋值 =设置默认值。可访问属性设置默认值没有意义。

```typescript
prop1: nasl.core.Integer = 0;
```

#### b. 字符串枚举

某些属性在静态绑定时，想要快速的选择效果，这时可以用 TS 的字符串枚举表示选项值，并配合枚举型 Setter 使用。但对应的 NASL 类型仍为 nasl.core.String。

```typescript
@Prop({
    title: '样式类型'
    setter: {
        concept: 'EnumSelectSetter',
        options: [{ title: '默认' }, { title: '浅色' }, { title: '成功色' }, { title: '警告色' }, { title: '危险色' }],
    },
    ...
})
color: 'default' | 'light' | 'success' | 'warning' | 'danger' = 'default';
```

目前枚举型的 Setter 主要有两种：EnumSelectSetter、CapsulesSetter，详见下表。

#### c. 设置器

| 设置器名称   | 说明   | 支持类型  | 效果图  |
| ------- | ------- | ------- | -------- |
| InputSetter |	输入框设置器（默认）|	any | ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2UngB0S-SSfgITWXlVWO9esKvlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194433912_ori.png) |
| SwitchSetter | 开关设置器 | nasl.core.Boolean | ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2Undx2z3qWxS-96vCHwXZllqvlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194435750_ori.png) |
| EnumSelectSetter | 枚举选择设置器 | nasl.core.String（字符串枚举形式） | ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2UkdKORQsiJsWJA2ckioqMiWvlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194435405_ori.png) |
| CapsulesSetter | 胶囊设置器 | nasl.core.String（字符串枚举形式） | ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2UqhKAosjlYxk_ol1B8jPXRWvlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194434044_ori.png) |
| NumberInputSetter | 数字输入设置器 | nasl.core.Integer \| nasl.core.Decimal | ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2UmKBf1g3BW78T4uF9Msao9yvlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194435068_ori.png) |
| IconSetter | 图标设置器 | nasl.core.String | ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2Ul8NNrAOsI9gUKQy1SbC3tavlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194435109_ori.png) ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2UjOG_LiEgjaj_F_t3JpXbgivlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194435958_ori.png) |
| ImageSetter | 图片设置器 | nasl.core.String | ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2UkpXHFVPJ-dfUWqX-PxvS02vlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194434095_ori.png) ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2UhE-Yx7gWDkfs-CkjW_R_YSvlla1eNN8CYwyAmYBjXqTQwd6xfZDUshqc4Ad8JVtEQ_20240625194434153_ori.png) |
| PropertySelectSetter | 属性选择设置器 | nasl.core.String | ![](https://community.codewave.163.com/libraryUpload/app/rIjitrRRLc7S2c2PfMj2Un2PD9_CYxwRDQwmYIonw5nTcv7BSdaiN-Ay1KdaxfUBaBR6ZMaKlQb_KUBW25I3lQ_20240625194435524_ori.png) |

#### d. 联动显隐和禁用
属性联动显隐使用 if进行配置。该选项接收一个箭头函数，表示该属性在什么情况下显示。_参数表示 IDE 中所有属性的当前状态。

比如下面的例子表示“显示总条数”这个属性选项在“分页”选项开启时才展示。

```typescript
@Prop<UTableViewOptions<T, V, P, M>, 'showTotal'>({
    title: '显示总条数',
    if: _ => _.pagination === true,
    ...
})
showTotal: nasl.core.Boolean = false;
```

联动禁用同理，配置 disabledIf即可。

#### e. 联动更新和清除
属性联动修改用 onChange进行配置。该选项接收一个复杂的数组类型。

下面的示例表示 checkAll 属性改变时，清除 min和 max属性值。

```typescript
@Prop<UCheckboxesOptions<T, V, C>, 'checkAll'>({
    ...
    onChange: [
        { clear: ['min', 'max'] }
    ],
})
checkAll: nasl.core.Boolean = false;
```

下面是一个复杂的联动更新的例子，表示当图片裁剪形状改变时，根据不同情况，修改另一个裁剪框的高度值。

```typescript
@Prop<UUploaderOptions, 'cropperPreviewShape'>({
    title: '图片裁剪框预览形状',
    onChange: [
        { update: { cropperBoxHeight: 200 }, if: _ => _ === 'rect' },
        { update: { cropperBoxHeight: 0 }, if: _ => _ === 'circle' },
        { update: { cropperBoxHeight: 0 }, if: _ => _ === 'square' },
    ],
    if: _ => _.openCropper === true && _.multiple !== true,
    ...
})
cropperPreviewShape: 'rect' | 'square' | 'circle' = 'circle';
```

### 2.6 事件配置要点
目前事件的 event参数必须有，推荐以匿名数据结构为主。

```typescript
@Event({
    title: '改变后',
    description: '单选或多选值改变后触发',
})
onChange: (event: {
    value: V;
    oldValue: V;
    item: T;
    oldItem: T;
    values: nasl.collection.List `<V>`;
    oldValues: nasl.collection.List `<V>`;
    items: nasl.collection.List `<T>`;
}) => void;
```

### 2.7 插槽配置要点

插槽为一个箭头函数类型，入参为插槽参数，返回为支持的组件类型数组。

下面的例子表示该默认插槽只支持侧边栏的几个子组件，并且在 snippets中添加了对应的片段。

```typescript
@Slot({
    title: '默认',
    snippets: [
        {
            title: '侧边栏分组',
            code: '`<u-sidebar-group>`<template #title>`<u-text text="分组"></u-text>``</template><u-sidebar-item>``<u-text text="侧边栏项"></u-text>``</u-sidebar-item></u-sidebar-group>`',
        },
        {
            title: '侧边栏项',
            code: '`<u-sidebar-item><u-text text="侧边栏项">``</u-text></u-sidebar-item>`',
        },
        {
            title: '分隔线',
            code: '`<u-sidebar-divider></u-sidebar-divider>`',
        },
    ],
})
slotDefault: () => Array<USidebarGroup | USidebarItem | USidebarDivider>;
```

循环类组件的插槽请使用 `current: Current<T>` 类型传递循环项 item。

```typescript
@Slot({
    title: '循环项的插槽',
    description: '自定义选项的结构和样式',
})
slotItem: (current: Current<T>) => Array<ViewComponent>;
```

### 2.8 泛型组件和类型推导

为了更精确的类型检查，一般循环类组件会用泛型表示：T表示 item的类型。

```typescript
export class MySelect<T> extends ViewComponent {
    value: nasl.core.String;
}

export class MySelectOptions<T> extends ViewComponentOptions {
    dataSource: nasl.collection.List<T>;
    value: nasl.core.String;
}
```

如果组件设计得更灵活一些，能让用户自行选择值字段。这时值字段的类型会随着用户选择而变化。

在设计时，一般用 V表示选择值的类型，再设置 valueField的属性类型进行类型推导。

```typescript
export class MySelect<T, V> extends ViewComponent {
    value: V;
}

export class MySelectOptions<T, V> extends ViewComponentOptions {
    dataSource: nasl.collection.List `<T>`;
    valueField: (item: T) => V; // 通过函数类型进行推导
    value: V;
}
```

这时可以看到一条属性的类型推导链：dataSource -> valueField -> value（反过来可以看成属性的类型依赖链）

更复杂的组件可能会有复杂的类型推导关系。假设这个选择器能够同时支持单/多选，那么它的 value类型会依赖 multiple这个选项属性的值。这时可以用 TS 的条件类型 A extends ? B : C来表示。同时需要再引入一个泛型参数。

```typescript
export class MySelect<T, V, M extends nasl.core.Boolean> extends ViewComponent {
    value: M extends true ? nasl.collection.List `<V>` : V;
}

export class MySelectOptions<T, V, M extends nasl.core.Boolean> extends ViewComponentOptions {
    dataSource: nasl.collection.List `<T>`;
    valueField: (item: T) => V; // 通过函数类型进行推导
    multiple: M;
    value: M extends true ? nasl.collection.List `<V>` : V;
}
```

这时的类型推导链为：`(dataSource -> valueField, multiple) -> value`，value的类型由前面的几个属性类型共同决定。

### 2.9 综合示例
综合前面的教程，下面完成一个完整的支持单/多选的“我的选择框”组件的 API 定义。

```typescript
@Component({
    title: '我的选择框',
    description: 'api.ts 示例组件',
})
export class MySelect<T, V, M extends nasl.core.Boolean> extends ViewComponent {
    @Prop({
        title: '选中值',
    })
    value: MySelect<T, V, M>['value']; // 这里为了和 MySelectOptions 保持一致

    @Method({
        title: '添加选项',
    })
    addItem(
        @Param({
            title: '要添加的选项',
        })
        item: T,
    ): void {}
}

export class MySelectOptions<T, V, M extends nasl.core.Boolean> extends ViewComponentOptions {
    @Prop({
        group: '数据属性',
        title: '数据源',
        description: '展示数据的输入源，可设置为集合类型变量（List `<T>`）或输出参数为集合类型的逻辑。',
    })
    dataSource: { list: nasl.collection.List `<T>`; total: nasl.core.Integer } | nasl.collection.List `<T>`;

    @Prop<USelectOptions<T, V, M>, 'valueField'>({
        group: '数据属性',
        title: '值字段',
        description: '集合的元素类型中，用于标识选中值的属性',
        setter: { concept: 'PropertySelectSetter' }, // 用属性选择器进行选择
    })
    valueField: (item: T) => V; // 通过函数类型进行推导'

    @Prop({
        group: '交互属性',
        title: '可多选',
        description: '设置是否可以多选行',
        setter: { concept: 'SwitchSetter' },
    })
    multiple: M;

    @Prop({
        group: '数据属性',
        title: '选中值',
        description: '当前选中的值',
        sync: true,
    })
    value: M extends true ? nasl.collection.List`<V>` : V;

    @Event({
        title: '改变后',
        description: '选择值改变时触发',
    })
    onChange: (event: {
        value: V;
        values: nasl.collection.List`<V>`;
    }) => void;

    @Slot({
        title: '默认',
        description: '插入子组件',
        snippets: [
            {
                title: '选项',
                code: '`<my-select-item><u-text text="选项">``</u-text></my-select-item>`',
            },
        ],
    })
    slotDefault: () => Array<MySelectItem<T, V>>;
}
```

## 3. 规范 References
### 3.1 `@Component` 的参数

```typescript
export interface ViewComponentOpts {
    /**
     * 组件标题
     */
    title: string;
    /**
     * 组件分组
     */
    group?: string;
    /**
     * 组件图标
     */
    icon?: string;
    /**
     * 组件描述
     */
    description?: string;
}
```

### 3.2 `@Prop` 的参数

```typescript
export interface PropOpts<T extends object, K extends keyof T> {
    /**
     * 属性标题
     */
    title: string;
    /**
     * 属性分组
     */
    group?: '基础信息' | '数据属性' | '主要属性' | '交互属性' | '状态属性' | '样式属性' | '工具属性';
    /**
     * 属性图标
     */
    icon?: string;
    /**
     * 属性描述
     */
    description?: string;
    /**
     * 属性是否具备双向绑定的功能
     */
    sync?: boolean;
    /**
     * 属性在 IDE 中的工具提示
     */
    tooltipLink?: string;
    /**
     * 属性文档描述
     */
    docDescription?: string;
    /**
     * 该属性的动态绑定功能是否隐藏
     * 对于某些属性可能不想支持动态绑定功能
     */
    bindHide?: boolean;
    /**
     * 切换该属性到动态绑定时，是否直接打开表达式编辑区
     */
    bindOpen?: boolean;
    /**
     * 该属性在属性面板配置还是在样式面板配置
     */
    tabKind?: 'property' | 'style';
    /**
     * 配置静态绑定时的设置器，比如开关、输入框、选择框等
     */
    setter?: BaseSetter<T, K>;
    /**
     * 在设计器中的默认填充数据，比如表格默认需要3列
     */
    designerValue?: any;
    /**
     * 用于控制属性联动，表示在什么情况下显示
     * @param target 配置时的属性对象
     */
    if?: (target: T) => boolean;
    /**
     * 用于控制属性联动，表示在什么情况下禁用
     * @param target 配置时的属性对象
     */
    disabledIf?: (target: T) => boolean;
    /**
     * 该属性在修改值时，触发其他哪些属性的更新
     */
    onChange?: Array<{ update: Array `<string>`; if?: (value: T[K]) => boolean } | { clear: Array `<string>`; if?: (value: T[K]) => boolean }>;
}
```

### 3.3 `@Event` 的参数

```typescript
export interface EventOpts {
    /**
     * 事件标题
     */
    title: string;
    /**
     * 事件描述
     */
    description?: string;
}
```

### 3.4 `@Method` 的参数

```typescript
export interface MethodOpts {
    /**
     * 方法标题
     */
    title: string;
    /**
     * 方法描述
     */
    description: string;
}
```

### 3.5 `@Slot` 的参数

```typescript
export interface SlotOpts {
    /**
     * 插槽标题
     */
    title: string;
    /**
     * 插槽描述
     */
    description?: string;
    /**
     * 空态图，比如表格没有设置数据源时的背景效果
     */
    emptyBackground?: string;
    /**
     * 代码片段
     */
    snippets?: Array `<ViewBlock>`;
}

export interface ViewBlock {
    /**
     * 代码片段标题
     */
    title: string;
    /**
     * 代码内容
     */
    code: string;
    /**
     * 代码片段描述
     */
    description?: string;
}
```

## 4. 发布相关

* 在发布组件时，该 `api.ts` 会结合截图、i18n 配置等功能，转换成 `nasl.ui.json`，遵循 NASL [ViewComponentDeclaration](https://nasl.codewave.163.com/docs/current/ast/view/ViewComponentDeclaration__/) AST 的定义。
* 在发布组件时，该 `api.ts` 会编译成 `nasl.ui.d.ts`，与 `NASL Language Server` 无缝衔接。

## 5. 规范生态
目前以下设施使用了该规范：

* CodeWave Vue2/React 基础组件库
* CodeWave IDE
* NASL Language Server
* NL2NASL 服务
* …
