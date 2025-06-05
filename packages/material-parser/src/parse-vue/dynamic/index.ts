import { camelCase, upperFirst } from 'lodash';
import {
  MaterialComponent,
  MaterialComponentAttr,
  McType,
} from '../../types/parse';
import { normalizeName } from '../config/utils';
import { requireInSandbox } from '../sandbox';
import { getEmitDefs, getExposeDefs, getPropDefs, isComponent } from './utils';

function getType(fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : '';
}

function transformType(type: any): McType {
  if (!type) {
    return {
      type: 'any',
    };
  }

  if (Array.isArray(type)) {
    if (type.length <= 1) {
      return transformType(type[0]);
    }

    return {
      type: 'union',
      value: type.map((t) => transformType(t)),
    };
  }

  switch (getType(type)) {
    case 'String':
      return {
        type: 'string',
      };
    case 'Number':
      return {
        type: 'number',
      };
    case 'Boolean':
      return {
        type: 'boolean',
      };
    case 'Function':
      return {
        type: 'function',
        params: [],
      };
  }

  return {
    type: 'any',
  };
}

function resolveAttrs(componentOptions: any, comp: MaterialComponent) {
  const propDefs = getPropDefs(componentOptions);

  propDefs.forEach((propDef) => {
    const type = transformType(propDef.type);
    const attr: MaterialComponentAttr = {
      name: propDef.name,
      description: '',
      type,
    };

    let defaultValue = propDef.default;
    try {
      if (typeof propDef.default === 'function' && type.type !== 'function') {
        defaultValue = propDef.default();
      }

      if (defaultValue && typeof defaultValue !== 'function') {
        attr.defaultValue = JSON.stringify(defaultValue);
      }
    } catch (e) {}

    comp.attrs.push(attr);
  });
}

function resolveEvents(componentOptions: any, comp: MaterialComponent) {
  const emits = getEmitDefs(componentOptions);

  emits.forEach((emitName) => {
    comp.events.push({
      name: normalizeName(emitName),
      description: '',
      params: [],
    });
  });
}

function resolveMethods(componentOptions: any, comp: MaterialComponent) {
  const exposes = getExposeDefs(componentOptions);

  exposes.forEach((exposeName) => {
    comp.methods.push({
      name: normalizeName(exposeName),
      description: '',
      params: [],
      returnType: {
        type: 'union',
      },
    });
  });
}
/**
 * 动态解析
 * @param filePath 入口文件路径
 * @returns MaterialComponent[]
 */
export default function (filePath: string): MaterialComponent[] {
  const moduleExports = requireInSandbox(filePath);

  if (!moduleExports) {
    return [];
  }

  const components: MaterialComponent[] = [];

  Object.keys(moduleExports).forEach((exportName) => {
    const baseComponent = moduleExports[exportName];
    const componentOptions =
      typeof baseComponent === 'function'
        ? baseComponent.options
        : baseComponent;
    if (!isComponent(componentOptions)) {
      return;
    }

    const comp: MaterialComponent = {
      name: componentOptions.name
        ? upperFirst(camelCase(componentOptions.name))
        : exportName,
      description: '',
      exportName,
      attrs: [],
      events: [],
      slots: [],
      methods: [],
    };

    [resolveAttrs, resolveEvents, resolveMethods].forEach((resolve) =>
      resolve(componentOptions, comp),
    );

    components.push(comp);
  });

  return components;
}
