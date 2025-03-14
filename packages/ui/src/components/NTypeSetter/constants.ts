import { NType } from '../../types';
export const TypeList: {
  label: string;
  value: NType['type'];
}[] = [
  {
    label: '字符串 (nasl.core.String)',
    value: 'string',
  },
  {
    label: '整数 (nasl.core.Integer)',
    value: 'integer',
  },
  {
    label: '浮点数 (nasl.core.Decimal)',
    value: 'decimal',
  },
  {
    label: '布尔值 (nasl.core.Boolean)',
    value: 'boolean',
  },
  {
    label: '日期 (nasl.core.Date)',
    value: 'date',
  },
  {
    label: '时间 (nasl.core.Time)',
    value: 'time',
  },
  {
    label: '日期时间 (nasl.core.DateTime)',
    value: 'datetime',
  },
  {
    label: '列表 (nasl.collection.List)',
    value: 'array',
  },
  {
    label: '映射 (nasl.collection.Map)',
    value: 'map',
  },
  {
    label: '结构体 ({ a: string, b: integer })',
    value: 'struct',
  },
  {
    label: '函数 ((param1: any) => void)',
    value: 'function',
  },
  {
    label: '联合类型 (string | integer)',
    value: 'union',
  },
  {
    label: '自定义类型',
    value: 'unknow',
  },
  {
    label: '任意类型 (any)',
    value: 'any',
  },
];
