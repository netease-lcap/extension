---
outline: deep
---

# 日期选择器

> 此组件未使用 ElementUI DatePicker 组件

* DatePicker 组件源码地址如下：[源码仓库地址](https://github.com/netease-lcap/ui-libraries/tree/develop/libraries/element-pro/design/date-picker)
* 接入组件源码地址如下：[源码仓库地址](https://github.com/netease-lcap/ui-libraries/blob/develop/libraries/element-pro/src/components/el-date-picker-pro)

## 平台能力适配

### 事件转换

多个选择事件参数由 `(value, position)` 格式合并为一个 `event` 对象, 参考文档：[事件转换](../../frontend/component/platform/event.md)

```ts
export function useContextEvents(props: MapGet, format: ComputedRef<string> | Ref<string>) {
  const events: Record<string, any> = {};

  ['onFocus', 'onBlur', 'onInput'].forEach((eventName) => {
    events[eventName] = (context) => {
      const handler = props.get(eventName);
      if (isFunction(handler)) {
        const changeEvent = getChangeEventByValue(context.value, props.get<boolean>('range'), format);
        handler({
          ...changeEvent,
          position: context && context.partial,
        });
      }
    };
  });

  events.onPick = (value: DateValue, context: PickContext) => {
    const handler = props.get('onPick');
    if (isFunction(handler)) {
      const changeEvent = getChangeEventByValue(value, false, format);
      handler({
        ...changeEvent,
        position: context && context.partial,
      });
    }
  };

  return events;
}
```

### 前缀 & 后缀图标

图标适配， 默认使用基础图标渲染, 参考文档： [图标设置](../../frontend/component/platform/icon-setter.md)

```ts
export function useIcons(props: MapGet) {
  const prefixIcon = props.useComputed('prefixIcon', (icon: string) => {
    if (!icon) {
      return undefined;
    }

    return (h: CreateElement) => {
      return h('el-icon', { attrs: { name: icon } });
    };
  });
  const suffixIcon = props.useComputed('suffixIcon', (icon: string) => {
    if (!icon) {
      return undefined;
    }

    return (h: CreateElement) => {
      return h('el-icon', { attrs: { name: icon } });
    };
  });

  return {
    prefixIcon,
    suffixIcon,
  };
}
```


### Nasl 日期值处理

参数 `value` 需要统一转为 `Date` 数据类型，同步至组件外是则需要格式化为 Nasl 日期类型

```ts
// Nasl Date 数据转 Date
function transformDate(date) {
  if (!date) {
    return undefined;
  }
  if (typeof date === 'string') {
    /**
     * 因为如果时间格式是 json 的字符串 "2021-06-18T07:55:26.914Z"
     * 不能做 - 的替换，会导致转化失效
     */
    if (date.includes('Q')) {
      return new Date(
        date
          .replace(/Q1/, '1')
          .replace(/Q2/, '4')
          .replace(/Q3/, '7')
          .replace(/Q4/, '10'),
      );
    }
    if (date.includes('W')) {
      return dayjs(date, [
        'YYYY-WWWW',
        'YYYY-WWWW H:mm:ss',
        'YYYY-WWWW HH:mm:ss',
      ]).toDate();
    }
    if (!date.includes('T')) {
      date = date.replace(/-/g, '/');
    }
    return new Date(date);
  }

  if (typeof date === 'number') {
    return new Date(date);
  }

  if (typeof date === 'object') {
    return date;
  }

  return undefined;
}


// 根据 format 转换为平台 日期类型
function getNaslDateValue(d: DateValue | null, format: any) {
  if (!d) {
    return null;
  }

  const date = dayjs(d);
  if (!date.isValid()) {
    return null;
  }

  const valueFormat = unref(format) || 'json';

  switch (valueFormat) {
    case 'json':
      return date.toDate().toJSON();
    case 'timestamp':
      return date.toDate().getTime();
    case 'date':
      return date.toDate();
    default:
      return date.format(valueFormat);
  }
}

```

## 页面编辑器适配

不需要特殊配置，设置 `idetype` 为 `element` 即可， 参考文档：[IDE页面设计器适配说明 element-配置](../../frontend/component/ide.md#element-配置)

```ts
@IDEExtraInfo({
  ideusage: {
    idetype: 'element',
  },
})
```

## `api.ts` 组件描述

参考文档：[组件配置描述编写](../../frontend/component/api.md)

```ts
/// <reference types="@nasl/types" />

namespace nasl.ui {
  @IDEExtraInfo({
    order: 3,
    ideusage: {
      idetype: 'element',
    },
  })
  @Component({
    title: '日期选择器',
    icon: 'date-picker',
    description: '用于选择某一具体日期或某一段日期区间。',
    group: 'Selector',
  })
  export class ElDatePickerPro extends ViewComponent {
    @Prop({
      title: '值',
    })
    value: ElDatePickerProOptions['value'];

    @Prop({
      title: '起始值',
    })
    startValue: ElDatePickerProOptions['startValue'];

    @Prop({
      title: '结束值',
    })
    endValue: ElDatePickerProOptions['endValue'];

    constructor(options?: Partial<ElDatePickerProOptions>) {
      super();
    }
  }

  export class ElDatePickerProOptions extends ViewComponentOptions {
    @Prop({
      group: '数据属性',
      title: '区间选择',
      description: '是否支持进行时间区间选择，关闭则为时间点选择',
      setter: {
        concept: 'SwitchSetter',
      },
      onChange: [{ clear: ['placeholderRight'] }],
    })
    range: nasl.core.Boolean = false;

    @Prop<ElDatePickerProOptions, 'value'>({
      group: '数据属性',
      title: '值',
      description: '选中值',
      setter: { concept: 'InputSetter' },
      if: (_) => _.range === false,
      sync: true,
    })
    value: nasl.core.String | nasl.core.Integer | nasl.core.Date | nasl.core.DateTime;

    @Prop<ElDatePickerProOptions, 'startValue'>({
      group: '数据属性',
      title: '起始值',
      description: '开始日期',
      setter: { concept: 'InputSetter' },
      if: (_) => !!_.range,
      sync: true,
    })
    startValue: nasl.core.String | nasl.core.Integer | nasl.core.Date | nasl.core.DateTime;

    @Prop<ElDatePickerProOptions, 'endValue'>({
      group: '数据属性',
      title: '结束值',
      description: '结束日期',
      setter: { concept: 'InputSetter' },
      if: (_) => !!_.range,
      sync: true,
    })
    endValue: nasl.core.String | nasl.core.Integer | nasl.core.Date | nasl.core.DateTime;

    @Prop({
      group: '数据属性',
      title: '转换器',
      description: '转换器，用于转换时间结果',
      docDescription: '用于转换选中的日期格式，支持JSON、Unix 时间戳、Date对象、YYYY-MM-DD共4种模式。默认YYYY-MM-DD',
      setter: {
          concept: 'EnumSelectSetter',
          options: [{ title: 'JSON' }, { title: 'Unix 时间戳' }, { title: 'Date 对象' }, { title: 'YYYY-MM-DD' }],
      },
    })
    converter: 'json' | 'timestamp' | 'date' | 'format' = 'format';

    @Prop({
      group: '主要属性',
      title: '允许输入',
      description: '是否允许输入日期',
      setter: { concept: 'SwitchSetter' },
    })
    allowInput: nasl.core.Boolean = false;

    @Prop({
      group: '样式属性',
      title: '无边框',
      description: '无边框模式',
      setter: { concept: 'SwitchSetter' },
    })
    borderless: nasl.core.Boolean = false;

    @Prop({
      group: '主要属性',
      title: '可清除',
      description: '是否显示清除按钮',
      setter: { concept: 'SwitchSetter' },
    })
    clearable: nasl.core.Boolean = false;

    @Prop({
      group: '数据属性',
      title: '最小日期值',
      description: '最小可选的日期值，默认为10年前，日期填写格式为“yyyy-mm-dd”',
      docDescription: '设置日期范围，支持输入的最小日期',
    })
    minDate:
      | nasl.core.String
      | nasl.core.Integer
      | nasl.core.Date
      | nasl.core.DateTime;

    @Prop({
      group: '数据属性',
      title: '最大日期值',
      description: '最大可选的日期值，默认为9年后，日期填写格式为“yyyy-mm-dd”',
      docDescription: '设置日期范围，支持输入的最大日期',
    })
    maxDate:
      | nasl.core.String
      | nasl.core.Integer
      | nasl.core.Date
      | nasl.core.DateTime;

    @Prop({
      group: '状态属性',
      title: '禁用',
      description: '是否禁用组件',
      setter: { concept: 'SwitchSetter' },
    })
    disabled: nasl.core.Boolean;

    @Prop({
      group: '状态属性',
      title: '只读',
      description: '只读状态',
      setter: { concept: 'SwitchSetter' },
    })
    readonly: nasl.core.Boolean;

    @Prop<ElDatePickerProOptions, 'mode'>({
      group: '主要属性',
      title: '日期类型',
      description: '选择器模式。可选项：year/quarter/month/week/date',
      setter: {
        concept: 'EnumSelectSetter',
        options: [
          { title: '年份' },
          { title: '季度' },
          { title: '月份' },
          { title: '周' },
          { title: '日期' },
        ],
      },
      onChange: [{
        update: {
          format: 'YYYY-MM-DD',
        },
        if: (val) => val === 'date',
      }, {
        update: {
          format: 'YYYY',
        },
        if: (val) => val === 'year',
      }, {
        update: {
          format: 'YYYY-MM',
        },
        if: (val) => val === 'month',
      }, {
        update: {
          format: 'GGGG-[W]WW',
        },
        if: (val) => val === 'week',
      }, {
        update: {
          format: 'YYYY-[Q]Q',
        },
        if: (val) => val === 'quarter',
      }]
    })
    mode: 'year' | 'quarter' | 'month' | 'week' | 'date' = 'date';

    @Prop({
      group: '主要属性',
      title: '第一天从星期几开始',
      description: '第一天从星期几开始',
      setter: {
        concept: 'NumberInputSetter',
        min: 1,
        max: 7,
      },
    })
    firstDayOfWeek: nasl.core.Decimal = 1;

    @Prop<ElDatePickerProOptions, 'format'>({
      group: '主要属性',
      title: '日期展示格式',
      description:
        '仅用于格式化日期显示的格式，不影响日期值。注意和 `valueType` 的区别，`valueType`会直接决定日期值 `value` 的格式。全局配置默认为："YYYY-MM-DD"，',
      setter: {
        concept: 'EnumSelectSetter',
        options: [
          { title: '中国（2023年7月26日）', if: _ => _.mode === 'date' },
          { title: 'ISO（2023-07-26）', if: _ => _.mode === 'date' },
          { title: 'US（7/26/2023）', if: _ => _.mode === 'date' },
          { title: 'EU（26/7/2023）', if: _ => _.mode === 'date' },
          { title: '2023-28周', if: _ => _.mode === 'week' },
          { title: '2023年第28周', if: _ => _.mode === 'week' },
          { title: '2023-W28', if: _ => _.mode === 'week' },
          { title: '中国（2023年7月）', if: _ => _.mode === 'month' },
          { title: 'ISO（2023-07）', if: _ => _.mode === 'month' },
          { title: 'US/EU（7/2023）', if: _ => _.mode === 'month' },
          { title: '2023年第3季度', if: _ => _.mode === 'quarter' },
          { title: '2023年Q3', if: _ => _.mode === 'quarter' },
          { title: '2023-Q3', if: _ => _.mode === 'quarter' },
          { title: '中国（2023年）', if: _ => _.mode === 'year' },
          { title: 'ISO（2023）', if: _ => _.mode === 'year' }
      ],
      },
    })
    format: 'YYYY年M月D日' | 'YYYY-MM-DD' | 'M/D/YYYY' | 'D/M/YYYY' | 'GGGG-W周' | 'GGGG年第W周' | 'GGGG-[W]WW' | 'YYYY年M月' | 'YYYY-MM' | 'M/YYYY' | 'YYYY年第Q季度' | 'YYYY年[Q]Q' | 'YYYY-[Q]Q' | 'YYYY年' | 'YYYY' = 'YYYY-MM-DD';

    @Prop({
      group: '主要属性',
      title: '占位符',
      description: '占位符。',
      setter: { concept: 'InputSetter' },
    })
    placeholder: nasl.core.String = '请选择日期';

    @Prop<ElDatePickerProOptions, 'placeholderRight'>({
      group: '主要属性',
      title: '右侧占位符',
      description:
        '时间选择框无内容时的提示信息，支持自定义编辑, 在没有设置的时候使用placeholder作为右侧占位符内容',
      if: (_) => _.range === true,
      implicitToString: true,
      setter: {
        concept: 'InputSetter',
        placeholder: '同占位符一致'
      }
    })
    placeholderRight: nasl.core.String = '';

    @Prop<ElDatePickerProOptions, 'separator'>({
      group: '主要属性',
      title: '分隔符',
      description: '日期分隔符，支持全局配置，默认为 -',
      if: (_) => _.range === true,
      setter: {
        concept: 'InputSetter',
      },
    })
    separator: nasl.core.String = '-';

    @Prop<ElDatePickerProOptions, 'enablePresets'>({
      group: '主要属性',
      title: '启用快捷设置',
      description: '启用预设快捷日期选择',
      setter: {
        concept: 'SwitchSetter',
      },
    })
    enablePresets: nasl.core.Boolean = false;

    @Prop<ElDatePickerProOptions, 'presetsPlacement'>({
      group: '主要属性',
      title: '快捷设置位置',
      description:
        '预设面板展示区域（包含确定按钮）。可选项：left/top/right/bottom',
      setter: {
        concept: 'EnumSelectSetter',
        options: [
          { title: '左侧' },
          { title: '顶部' },
          { title: '右侧' },
          { title: '底部' },
        ],
      },
      if: (_) => _.enablePresets === true,
    })
    presetsPlacement: 'left' | 'top' | 'right' | 'bottom' = 'bottom';

    @Prop({
      title: '前缀图标',
      description: '前缀图标',
      group: '主要属性',
      setter: {
        concept: 'IconSetter',
        customIconFont: 'LCAP_ELEMENTUI_ICONS',
      },
    })
    prefixIcon: nasl.core.String;

    @Prop({
      title: '后缀图标',
      description: '后缀图标',
      group: '主要属性',
      setter: {
        concept: 'IconSetter',
        customIconFont: 'LCAP_ELEMENTUI_ICONS',
      },
    })
    suffixIcon: nasl.core.String;

    @Prop({
      group: '样式属性',
      title: '尺寸',
      description: '输入框尺寸。可选项：small/medium/large。',
      setter: {
        concept: 'EnumSelectSetter',
        options: [
          { title: '小' },
          { title: '中' },
          { title: '大' },
        ],
      },
    })
    size:
      | 'small'
      | 'medium'
      | 'large' = 'medium';

    @Prop({
      group: '样式属性',
      title: '宽度随内容自适应',
      description: '宽度随内容自适应',
      setter: {
        concept: 'SwitchSetter',
      },
    })
    autoWidth: nasl.core.Boolean = false;

    @Prop({
      group: '样式属性',
      title: '文本内容位置',
      description: '文本内容位置，居左/居中/居右',
      setter: {
        concept: 'EnumSelectSetter',
        options: [
          { title: '左对齐' },
          { title: '居中对齐' },
          { title: '右对齐' },
        ],
      },
    })
    align: 'left' | 'center' | 'right' = 'left';

    @Event({
      title: '失焦时',
      description: '当输入框失去焦点时触发',
    })
    onBlur: (event: {
      value: nasl.core.String | nasl.core.Date,
      startValue: nasl.core.String | nasl.core.Date,
      endValue: nasl.core.String | nasl.core.Date,
      position: 'start' | 'end',
     }) => any;

    @Event({
      title: '值改变时',
      description: '选中值发生变化时触发。',
    })
    onChange: (event: {
      value: nasl.core.String | nasl.core.Date,
      startValue: nasl.core.String | nasl.core.Date,
      endValue: nasl.core.String | nasl.core.Date,
      trigger: 'confirm' | 'pick' | 'enter' | 'preset' | 'clear',
     }) => any;

    @Event({
      title: '聚焦时',
      description: '输入框获得焦点时触发',
    })
    onFocus: (event: {
      value: nasl.core.String | nasl.core.Date,
      startValue: nasl.core.String | nasl.core.Date,
      endValue: nasl.core.String | nasl.core.Date,
      position: 'start' | 'end',
     }) => any;

    @Event({
      title: '面板选中后',
      description: '面板选中值后触发',
    })
    onPick: (event: {
      value: nasl.core.String | nasl.core.Date,
      startValue: nasl.core.String | nasl.core.Date,
      endValue: nasl.core.String | nasl.core.Date,
      position: 'start' | 'end',
     }) => any;
  }
}
```
