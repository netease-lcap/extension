---
outline: deep
---

<script setup>
import { VTCodeGroup, VTCodeGroupTab } from '../../../.vitepress/components'
</script>

# 数据源

平台数据属性统一为 `dataSource` 属性，可以直接绑定后端逻辑，获取远程数据

一下已选择器组件为例

## `api.ts` 增加数据源相关属性

```ts
@Component({
  title: '选择器',
  description: '选择器',
})
export class SelectOptions<T, V> extends ViewComponent {
  constructor(options?: Partial<SelectOptions<T, V>>) {
    super();
  }

  @Method({
    title: '重新加载数据',
    description: '重新加载数据'
  })
  reload(): void {} // 需要提供重新加载数据源的方法
}
// api.ts
export class SelectOptions<T, V> extends ViewComponentOptions {
  @Prop({
    group: '数据属性',
    title: '数据源',
    description: '展示数据的输入源，可设置为数据集对象或者返回数据集的逻辑',
    docDescription: '列表展示的数据。数据源可以绑定变量或者逻辑。变量或逻辑的返回值可以是数组，也可以是对象。对象格式为{list:[], total:10}',
  })
  dataSource: { list: nasl.collection.List<T>; total: nasl.core.Integer } | nasl.collection.List<T>;

  @Prop({
    group: '数据属性',
    title: '数据类型',
    description: '数据源返回的数据结构的类型，自动识别类型进行展示说明',
    docDescription: '列表每一行的数据类型。该属性为展示属性，由数据源推倒得到，无需填写。',
  })
  dataSchema: T;


  @Prop({
    group: '数据属性',
    title: '文本字段',
    description: '选项文本的字段名',
    setter: {
      concept: "PropertySelectSetter"
    }
  })
  textField: (item: T) => any = ((item: T) => item.text) as any;

  @Prop({
    group: '数据属性',
    title: '值字段',
    description: '选项文本的字段名',
    setter: {
      concept: "PropertySelectSetter"
    }
  })
  valueField: (item: T) => V = ((item: T) => item.value) as any;;
}
```

## 组件内部加载数据 & 渲染

<VTCodeGroup>
  <VTCodeGroupTab label="Vue2">

  [Element UI Select](https://element.eleme.cn/#/zh-CN/component/select) 支持数据源示例

  ```vue
  <template>
  <el-select v-bind="$attrs" v-on="$listeners" :loading="loading">
    <template v-if="!!dataSource">
       <el-option
        v-for="item in list"
        :key="lodashGet(item, valueField)"
        :label="lodashGet(item, textField)"
        :value="lodashGet(item, valueField)">
      </el-option>
    </template>
    <slot v-else></slot>
  </el-select>
  </template>
  <script>
  import lodashGet from 'lodash/get';

  export default {
    props: {
      dataSource: {
        type: [Array, Object, Function]
      },
      textField: {
        type: String,
        default: 'text',
      },
      valueField: {
        type: String,
        default: 'value',
      },
    },
    data() {
      return {
        list: [],
        loading: false,
      };
    },
    watch: {
      dataSource: {
        handler() {
          this.$nextTick(() => {
            this.loadDataSource();
          });
        },
        immediate: true
      },
    },
    methods: {
      lodashGet,
      normalizeData(data) {
        if (Array.isArray(data)) {
          return data;
        }

        if (typeof data === 'object' && Array.isArray(data.list)) {
          return data.list;
        }

        return [];
      },

      async loadDataSource() {
        if (typeof this.dataSource === 'function') {
          this.loading = true;
          const data = await this.dataSource({});
          this.list = this.normalizeData(data);
          this.loading = false;
        } else {
          this.list = this.normalizeData(this.dataSource);
        }
      },
      async reload() {
        return this.loadDataSource();
      },
    },
  }
  </script>
  ```

  </VTCodeGroupTab>
  <VTCodeGroupTab label="React">

  [Ant Design Select](https://ant-design.antgroup.com/components/select-cn) 支持数据源示例
  ```tsx
  import React, { useState, useEffect, useImperativeHandle, useMemo } from 'react';
  import { Select } from 'antd';
  import lodashGet from 'lodash/get';

  const normalizeData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (typeof data === 'object' && Array.isArray(data.list)) {
      return data.list;
    }

    return [];
  }

  const useDataSource = (dataSource) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadDataSouce = useCallback(async () => {
      if (typeof dataSource !== 'function') {
        return;
      }

      setLoading(true);
      const result = await this.dataSource({});
      setData(normalizeData(result));
      setLoading(false);
    }, [dataSource]);
    
    useEffect(() => {
      loadDataSouce();
    }, [loadDataSouce]);

    return {
      reload: loadDataSouce,
      data: useMemo(() => {
        if (typeof dataSource !== 'function') {
          return normalizeData(dataSource);
        }

        return data;
      }, [data, dataSource]),
      loading,
    }
  }

  export const Select = React.forwardRef((props, ref) => {
    const {
      dataSource,
      textField = 'text',
      valueField = 'value',
      ...rest
    } = props;

    const { data, loading, reload } = useDataSource(dataSource);

    const options = useMemo(() => {
      return data.map((item) => {
        return {
          label: lodashGet(item, textField),
          value: lodashGet(item, valueField),
        };
      });
    }, [data, textField, valueField]);

    useImperativeHandle(ref, () => {
      return {
        reload,
      };
    }, [reload]);

    return (
      <Select
        {...rest}
        options={options}
        loading={loading}
      />
    );
  });
  ```

  </VTCodeGroupTab>
</VTCodeGroup>


