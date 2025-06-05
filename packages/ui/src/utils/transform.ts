import { isNil } from 'lodash';
import { NType, NArrayType, NStructType, NMapType, NUnionType, NFunctionType, NUnknowType } from '../types';
import { DefaultValue } from '@nasl/types/nasl.ui.ast';

export function transformNType(type: NType): string {
  switch (type.type) {
    case 'string':
      return 'nasl.core.String';
    case 'integer':
      return 'nasl.core.Integer';
    case 'decimal':
      return 'nasl.core.Decimal';
    case 'boolean':
      return 'nasl.core.Boolean';
    case 'date':
      return 'nasl.core.Date';
    case 'time':
      return 'nasl.core.Time';
    case 'datetime':
      return 'nasl.core.DateTime';
    case 'array':
      return `nasl.collection.List<${transformNType((type as NArrayType).value)}>`;
    case 'struct':
      return `{ ${(type as NStructType).value.map((item) => `${item.name}: ${transformNType(item.type)}`).join(', ')} }`;
    case 'map':
      return `nasl.collection.Map<${transformNType((type as NMapType).key)}, ${transformNType((type as NMapType).value)}>`;
    case 'union':
      return (type as NUnionType).value.map((item) => ['function'].includes(item.type) ? `(${transformNType(item)})` : transformNType(item)).join(' | ');
    case 'function':
      return `(${(type as NFunctionType).params.map((item) => `${item.name}: ${transformNType(item.type)}`).join(', ')}) => ${!(type as NFunctionType).returnType || (type as NFunctionType).returnType === 'void' ? 'void' : transformNType((type as NFunctionType).returnType as NType)}`;
    case 'unknow':
      return (type as NUnknowType).raw;
    default:
      return 'any';
  }
}

export function transformDefaultValue(defaultValue?: DefaultValue): string {
  if (!defaultValue?.expression) {
    return '';
  }

  switch (defaultValue.expression?.concept) {
    case 'NullLiteral':
      return 'null';
    case 'BooleanLiteral':
      return defaultValue.expression.value;
    case 'StringLiteral':
      return `'${defaultValue.expression.value}'`;
    case 'NumericLiteral':
      return defaultValue.expression.value;
    case 'NewList':
      return `[${defaultValue.expression.items.map((item) => transformDefaultValue({ expression: item } as DefaultValue)).filter((v) => !isNil(v)).join(', ')}]`;
    default:
      return '';
  }
}