---
outline: deep
---

<script setup>
import { VTCodeGroup, VTCodeGroupTab } from '../../../.vitepress/components'
</script>

# 数据源

## 1. 功能说明

平台数据属性统一为dataSource属性，可以直接绑定后端逻辑，获取远程数据。

以下以选择器组件为例：

<img src="../../../images//shujuyuan_202411211021_1.png" class="imgStyle" style="" />

## 2. 功能实现

### 2.1 增加数据源相关属性

向 api.ts 文件中写入数据源相关属性。

以下以选择器组件为例：包含“数据源”、“数据类型”、“文本字段”、“值字段”属性以及重新加载数据源的组件逻辑(reload)。

```typescript
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
  textField: (item: T) => any;


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

### 2.2 组件内部加载数据和渲染


<VTCodeGroup>
  <VTCodeGroupTab label="Vue3">

  参考[Element Plus Select](https://element-plus.org/zh-CN/component/select.html)支持数据源示例。

  ```typescript
  // src/hooks/useDataSource.ts
  import { defineExpose, ref, toRefs, watch, useAttrs } from 'vue';

  /**
   * @param props       组件参数
   *
   * @emits before-load dataSource 远程加载请求前
   * @emits load        dataSource 远程加载请求后
   *
   * @return list       dataSource 返回的数据
   * @return loading    加载状态
   */
  export const useDataSource = (props) => {
    const {dataSource} = toRefs(props);
    const attrs = useAttrs() as any;

    const list = ref<Array<any>>([]);
    const loading = ref(false);
    watch(dataSource, () => {
      loadList();
    });
    // dataSource 加载数据
    const loadList = async () => {
      if (typeof dataSource.value === 'function') {
        loading.value = true;

        if (attrs.onBeforeLoad) {
          attrs.onBeforeLoad();
        }

        const data = await dataSource.value({});

        list.value = normalizeData(data);
        loading.value = false;
        if (attrs.onLoad) {
          attrs.onLoad();
        }

      } else {
        list.value = normalizeData(dataSource.value);
      }
    };

    /**
     * 过滤data
     * @param data
     */
    const normalizeData = (data) => {
      if (Array.isArray(data)) {
        return data;
      }

      if (typeof data === 'object' && Array.isArray(data.list)) {
        return data.list;
      }

      return [];
    };

    loadList();

    return {
      list,
      loading,
      reload: loadList
    };
  }
  ```

  ```vue
  <template>
    <el-select v-bind="$attrs" :loading="loading">
      <el-option
        v-for="item in list"
        :key="lodashGet(item, valueField)"
        :label="lodashGet(item, textField)"
        :value="lodashGet(item, valueField)"
      >
      </el-option>
    </el-select>
  </template>
  <script setup lang="ts">
  import lodashGet from 'lodash/get';
  import { ElSelect, ElOption } from 'element-plus';
  import { defineExpose } from 'vue';
  import { useDataSource } from '@/hooks/useDataSource.ts';

  const props = defineProps({
    dataSource: [Array, Function, Object],
    dataSchema: { type: String, default: 'entity' },
    textField: { type: String, default: 'text' },
    valueField: { type: String, default: 'value' },
  });

  const { list, loading, reload } = useDataSource(props);

  defineExpose({
    reload
  });
  </script>
  ```

  </VTCodeGroupTab>

  <VTCodeGroupTab label="Vue2">

  参考[Element UI Select](https://element.eleme.cn/#/zh-CN/component/select)支持数据源示例。

  ```typescript
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

  参考[Ant Design Select](https://ant-design.antgroup.com/components/select-cn)支持数据源示例。

  ```typescript
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
