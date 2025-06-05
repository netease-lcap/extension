import {
  ComponentDoc,
} from 'vue-inbrowser-compiler-independent-utils';
import { MaterialComponent, McType } from '../../types/parse';
import { parseFile } from './parse';

function transformType(type?: { name: string }): McType {
  if (!type) {
    return {
      type: 'any'
    };
  }

  switch (type.name.trim().toLowerCase()) {
    case 'string':
      return {
        type: 'string',
      };
    case 'number':
      return {
        type: 'number',
      };
    case 'boolean':
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

function resolveAttrs(doc: ComponentDoc, component: MaterialComponent) {
  if (!doc.props || doc.props.length === 0) {
    return component;
  }

  doc.props.forEach((prop) => {
    component.attrs.push({
      name: prop.name,
      description: prop.description || '',
      defaultValue: prop.defaultValue?.value,
      type: transformType(prop.type),
    });
  });

  return component;
}

function resolveEvents(doc: ComponentDoc, component: MaterialComponent) {
  if (!doc.events || doc.events.length === 0) {
    return component;
  }

  doc.events.forEach((event) => {
    component.events.push({
      name: event.name,
      description: event.description || '',
      params: [],
    });
  });

  return component;
}

function resolveSlots(doc: ComponentDoc, component: MaterialComponent) {
  if (!doc.slots || doc.slots.length === 0) {
    return component;
  }

  doc.slots.forEach((slot) => {
    component.slots.push({
      name: slot.name,
      description: slot.description || '',
      params: slot.scoped ? [{ name: 'current', type: { type: 'any' }}] : [],
    });
  });

  return component;
}

function resolveMethods(doc: ComponentDoc, component: MaterialComponent) {
  if (!doc.methods || doc.methods.length === 0) {
    return component;
  }

  doc.methods.forEach((method) => {
    component.methods.push({
      name: method.name,
      description: method.description || '',
      params: (method.params || []).map((p) => ({
        name: p.name,
        description: p.description || '',
        type: {
          type: 'any',
        }
      } as any)),
      returnType: {
        type: 'any',
      },
    })
  });

  return component;
}

function resolveSchema(doc: ComponentDoc): MaterialComponent {
  const component: MaterialComponent = {
    name: doc.displayName,
    exportName: doc.exportName,
    description: doc.description || '',
    attrs: [],
    events: [],
    slots: [],
    methods: []
  };

  [
    resolveAttrs,
    resolveEvents,
    resolveSlots,
    resolveMethods,
  ].forEach((resolve) => {
    resolve(doc, component);
  });

  return component;
}

/**
 * js语法解析
 * @param filePath 入口文件路径
 * @returns MaterialComponent[]
 */
export default async function(filePath: string): Promise<MaterialComponent[]> {
	const docs = await parseFile({
    filePath,
    lang: 'js',
    validExtends: () => true,
  });

  return docs.map((doc) => {
    return resolveSchema(doc.toObject());
  });
}
