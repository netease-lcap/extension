---
outline: deep
---

# 表达式API说明与示例

## 表达式API说明

在组件的配置项使用表达式时，可以将表达式分为两种：

1.  带target参数：例如parentAccept、childAccept、accept配置项

    ```typescript
    "parentAccept": "target.tag === 'u-crumb'"
    ```

1.  不带target参数：其他的表达式

    表达式内部通过 ‘this‘ 来指向自己，this上定义了一系列的属性和API：

    ```typescript
    type Attribute {
        name: string,
        value: any
    }
    class Element {
        // 处于的slot名称
        slotTarget: string
        
        // 获取当前的参数
        getAttribute: (attrname: string) => Attribute
        
        // 根据条件获取子元素
        getElement: (filter: (el: Element) => boolean) => ?Element
        // 根据条件过滤子元素
        filterElement: (filter: (el: Element) => boolean) => Element[]
        // 获得父节点
        getParent: () => Element
        // 子节点个数
        elementsLength: () => number
        
        // 设计器缓存状态(deprecated)
        // setCacheStatus: (cachename: string, initialStatus: any) => void
        // 获取设计器缓存状态(deprecated)
        // getCacheStatus: (cachename: string) => any
        // 调用组件方法 (废弃)
        // callComponentMethod: (funcName: string, ...args: any[]) => void
        
        // 获取祖先节点
        getAncestor: (tag: string) => ?Element
    }

    class Target {
        // 对应到nasl节点的concept
        concept: string;
        // 目标的 tag 属性
        tag: string;
    }
    ```

## 表达式API示例

### 示例一

这段表达了Flex是一个container，他的containerDirecion由当前设计器内设置的direction属性值决定。

```typescript
{
    "name": "Flex",
    "ideusage": {
        "idetype": "container",
        "containerDirection": "this.getAttribute('direction')?.value === 'true' ? 'column' : 'row' "
    }
}
```

### 示例二

这段表达了Table是一个container，他的内部只允许放入TableColumn，只能通过snippet增加子节点，他具有数据源的特性，默认展示3条假记录，根据'table > tbody > tr'这个选择器来禁用除了第一条以外的假数据，在当前没有设置dataSource属性或者当前子节点数量为0时，展示占位。

TableColumn也是一个container，不支持放入子元素，只允许放入Table中，由于组件实现问题，只能通过向其title的slot内部放入一个能够根据css选择器，向上查找DOM节点的组件，

```typescript
{
    "name": "Table",
    "ideusage": {
        "idetype": "container",
        "containerDirection": "row",
        "structured": true,
        "dataSource": {
          "display": 3,
          "loopElem": "table > tbody > tr",
          "emptySlot": {
            "condition": "!this.getAttribute('dataSource') || this.elementsLength() === 0",
            "accept": "target.concept === 'Entity'"
          }
        },
        "childAccept": "target.tag === 'TableColumn'"
    }
}
{
    "name": "TableColumn",
    "ideusage": {
        "idetype": "container",
        "childAccept": false,
        "parentAccept": "target.tag === 'Table'",
        "containerDirection": "row",
        "selector": {
          "expression": "this.getElement(el => el.slotTarget === 'title')",
          "cssSelector": "th"
        }
    }
}
```

### 示例三

这段表达了Modal是一个modal类型的组件，由于组件实现问题，只能通过向其内部放入一个能够根据css选择器:"div\[class='ant-modal-content']"，向上查找DOM节点的组件。为了去除弹窗编辑时的闪动，需要额外增加设计器专门的配置 additionalAttribute。

```typescript
{
    "name": "Modal",
    "ideusage": {
        "idetype": "modal",
        "selector": {
          "expression": "this",
          "cssSelector": "div[class='ant-modal-content']"
        },
        "additionalAttribute": {
            "transitionName": "''",
            "maskStyle": "{{opacity: 1,animationDuration: '0s'}}"
        }
    }
}
```

### 示例四

这段表达了Popover是一个popover类型的组件，由于组件实现问题，只能通过向其content的slot内部放入一个能够根据css选择器:"div\[class='ant-popover-content']"，向上查找DOM节点的组件。通过设置actions，用户能在设计器内部通过点击，修改组件的临时状态，通过open或close方法，打开关闭下拉框编辑。

```typescript
 {
    "name": "Popover",
    "ideusage": {
        "idetype": "popover",
        "selector": {
          "expression": "this.getElement(el => el.slotTarget === 'content')",
          "cssSelector": "div[class='ant-popover-content']"
        }
    }
}
```


