import { isNil } from 'lodash';
import {
  MaterialComponent,
  MaterialComponentAttr,
  MaterialComponentEvent,
  MaterialComponentMethod,
  MaterialComponentSlot,
  McArrayType,
  McFunctionType,
  McMapType,
  McStructType,
  McType,
  McUnionType,
} from '../types/parse';
import {
  BasicType,
  ComplexType,
  FunctionType,
  PropsSection,
  PropType,
} from './schema/types';
import { IMaterialParsedModel } from './types';

const eventRegex = /^on[A-Z].*/;

type Prop = PropsSection['props'][0];

function isEventProp(prop: Prop) {
  return prop.name && eventRegex.test(prop.name);
}

function isSlotPropType(propType: PropType) {
  if (typeof propType === 'string') {
    return ['node', 'element'].includes(propType);
  }

  if (['node', 'element'].includes(propType.type)) {
    return true;
  }

  if (
    propType.type === 'func' &&
    propType.returns &&
    propType.returns.propType &&
    isSlotPropType(propType.returns.propType)
  ) {
    return true;
  }

  if (
    propType.type === 'oneOfType' &&
    propType.value.findIndex(isSlotPropType) !== -1
  ) {
    return true;
  }

  return false;
}

function isSlotProp(prop: Prop) {
  if (!prop || !prop.propType) {
    return false;
  }

  return isSlotPropType(prop.propType);
}

function stringify(str: any) {
  try {
    str = JSON.parse(str);
  } catch (e) {}

  return JSON.stringify(str);
}
const PropTypeDict: Record<BasicType | ComplexType['type'], McType['type']> = {
  array: 'array',
  bool: 'boolean',
  func: 'function',
  number: 'number',
  object: 'any',
  string: 'string',
  node: 'any',
  element: 'any',
  any: 'any',
  objectOf: 'map',
  arrayOf: 'array',
  oneOf: 'union',
  oneOfType: 'union',
  shape: 'struct',
  exact: 'struct',
};

const unionDictTypes = (types: McType[]) => {
  const cache: Record<string, any> = {};
  return types.reduce((acc: any, t) => {
    const k = JSON.stringify(t);
    if (cache[k]) {
      return acc;
    }

    cache[k] = t;
    return [...acc, t];
  }, []);
};

function transformType(propType: PropType | undefined | null): McType {
  if (isNil(propType)) {
    return {
      type: 'any',
    };
  }
  if (typeof propType === 'string') {
    return {
      type: PropTypeDict[propType] || 'any',
    };
  }

  const mcType: McType = {
    type: PropTypeDict[propType.type] || 'any',
  };

  if (propType.isRequired) {
    mcType.isRequired = true;
  }

  switch (propType.type) {
    case 'oneOf':
      (mcType as McUnionType).value = propType.value.map((s) => stringify(s));
      break;
    case 'oneOfType':
      (mcType as McUnionType).value = unionDictTypes(
        propType.value.map((p) => transformType(p)),
      );
      break;
    case 'arrayOf':
      (mcType as McArrayType).value = transformType(propType.value);
      break;
    case 'shape':
    case 'exact':
      (mcType as McStructType).value = propType.value.map((p) => {
        return {
          name: p.name as string,
          type: p.propType ? transformType(p.propType) : { type: 'any' },
        };
      });
      break;
    case 'objectOf':
      (mcType as McMapType).value = transformType(propType.value);
      break;
    case 'func':
      (mcType as McFunctionType).params = resolveParams(propType);
      (mcType as McFunctionType).returnType = transformType(propType.returns?.propType);
      break;
    default:
      break;
  }

  return mcType;
}

function resolveParams(propType: PropType) {
  if (typeof propType === 'string' || propType.type !== 'func' || !propType.params || propType.params.length === 0) {
    return [];
  }

  return propType.params.map((p) => {
    return {
      name: p.name,
      description: p.description,
      type: transformType(p.propType),
    };
  });
}

function resolveEvent(prop: Prop, component: MaterialComponent) {
  if (!isEventProp(prop)) {
    return false;
  }

  const params = resolveParams(prop.propType);
  component.events.push({
    name: prop.name,
    description: prop.description || '',
    params: params.length === 0 ? [{
      name: 'event',
      type: {
        type: 'any',
      },
    }] : params,
  });

  return true;
}

function findSlotFuncType(propType: PropType): FunctionType | undefined {
  if (typeof propType === 'string') {
    return;
  }

  if (
    propType.type === 'func' &&
    propType.returns &&
    propType.returns.propType &&
    isSlotPropType(propType.returns.propType)
  ) {
    return propType;
  }

  if (propType.type === 'oneOfType') {
    return propType.value.find(
      (p) =>
        typeof p !== 'string' &&
        p.type === 'func' &&
        p.returns &&
        p.returns.propType &&
        isSlotPropType(p.returns.propType),
    ) as FunctionType | undefined;
  }

  return;
}

function resolveSlot(prop: Prop, component: MaterialComponent) {
  if (!isSlotProp(prop)) {
    return false;
  }

  const slot: MaterialComponentSlot = {
    name: prop.name,
    description: prop.description || '',
    params: [],
  };

  const funcType = findSlotFuncType(prop.propType);

  if (funcType && funcType.params && funcType.params.length > 0) {
    slot.params = funcType.params.map(
      (param) =>
        ({
          name: param.name,
          description: param.description,
          type: transformType(param.propType),
        } as any),
    );
  }

  component.slots.push(slot);

  return true;
}

function resolveAttr(prop: Prop, component: MaterialComponent) {
  const attr: MaterialComponentAttr = {
    name: prop.name,
    description: prop.description || '',
    type: transformType(prop.propType),
  };

  if (prop.defaultValue) {
    attr.defaultValue = stringify(prop.defaultValue);
  }

  if (['value', 'opened', 'open', 'visible'].includes(prop.name)) {
    attr.sync = true;
  }

  if (
    typeof prop.propType !== 'string' &&
    prop.propType &&
    prop.propType.type === 'oneOf'
  ) {
    attr.options = prop.propType.value.map((v) => ({
      value: JSON.stringify(v),
      label: String(v),
    }));
  }

  component.attrs.push(attr);
  return true;
}

export function resolveReactSchema(
  schema: IMaterialParsedModel,
): MaterialComponent {
  const { exportName = '', subName = '' } = schema.meta as {
    exportName: string;
    subName: string;
  };
  const component: MaterialComponent = {
    name: schema.componentName,
    exportName,
    subName,
    description: schema.description || '',
    methods: [] as MaterialComponentMethod[],
    attrs: [] as MaterialComponentAttr[],
    events: [] as MaterialComponentEvent[],
    slots: [] as MaterialComponentSlot[],
  };

  (schema.props || []).forEach((prop) => {
    [resolveEvent, resolveSlot, resolveAttr].find((resolve) =>
      resolve(prop, component),
    );
  });

  return component;
}
