import { isEmpty } from 'lodash';
// import * as path from 'path';
// @ts-ignore
import parsePropTypes from 'parse-prop-types';
import { transformItem } from '../transform';
import requireInSandbox from './requireInSandbox';

export interface IComponentInfo {
  component: any;
  meta: {
    exportName: string;
    subName?: string;
  };
}

const reservedKeys = [
  'propTypes',
  'defaultProps',
  'name',
  'arguments',
  'caller',
  'length',
  'contextTypes',
  'displayName',
  '__esModule',
  'version',
];

function getKeys(com: any) {
  const keys = Object.keys(com).filter((x) => {
    return !reservedKeys.includes(x) && !x.startsWith('_');
  });

  return keys;
}

function isComponent(obj: any) {
  return (
    typeof obj === 'function' &&
    (Object.prototype.hasOwnProperty.call(obj, 'propTypes') ||
      Object.prototype.hasOwnProperty.call(obj, 'defaultProps'))
  );
}

function getTypeFromValue(value: any) {
  const t = typeof value;
  switch (t) {
    case 'bigint':
    case 'number':
      return 'number';
    case 'function':
      return 'func';
    case 'boolean':
      return 'bool';
    case 'string':
      return 'string';
    default:
      return 'any';
  }
}

export default function (filePath: string) {
  if (!filePath) return [];
  const Com = requireInSandbox(filePath);
  const components: IComponentInfo[] = [];
  let index = 0;

  if (Com.__esModule) {
    const keys = getKeys(Com);
    keys.forEach((k) => {
      if (isComponent(Com[k])) {
        components.push({
          component: Com[k],
          meta: {
            exportName: k,
          },
        });
      }
    });
  } else if (isComponent(Com)) {
    components.push({
      component: Com,
      meta: {
        exportName: 'default',
      },
    });
  }

  // dps
  while (index < components.length) {
    const item = components[index++];

    const keys = getKeys(item.component);
    const subs = keys
      .filter((k) => isComponent(item.component[k]))
      .map((k) => ({
        component: item.component[k],
        meta: {
          ...item.meta,
          subName: k,
        },
      }));
    if (subs.length) {
      components.splice(index, 0, ...subs);
    }
  }

  const result = components.reduce((acc: any, { meta, component }) => {
    const componentInfo = parsePropTypes(component);

    if (!isEmpty(componentInfo)) {
      const props = Object.keys(componentInfo).reduce((acc2: any[], name) => {
        try {
          const item: any = transformItem(name, componentInfo[name]);
          acc2.push(item);
        } catch (e) {
          // TODO
        }
        return acc2;
      }, []);

      return [
        ...acc,
        {
          meta,
          props,
          componentName:
            meta.subName || meta.exportName || component.displayName,
        },
      ];
    }

    return [
      ...acc,
      {
        meta,
        props: Object.keys(component.defaultProps).map((name) => ({
          name,
          propType: getTypeFromValue(component.defaultProps[name]),
          defaultValue: component.defaultProps[name],
        })),
        componentName: meta.subName || meta.exportName || component.displayName,
      },
    ];
  }, []);

  return result;
}
