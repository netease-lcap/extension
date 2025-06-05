import { camelCase, isPlainObject } from 'lodash';
const VUE_COMPONENTS_KEYS = ['data', 'props', 'methods', 'computed', 'emits'];

export function isComponent(obj: any) {
  if (typeof obj === 'object') {
    return (
      Object.keys(obj).findIndex((k) => VUE_COMPONENTS_KEYS.includes(k)) !== -1
    );
  } else if (typeof obj === 'function') {
    return (
      obj.options &&
      Object.keys(obj.options).findIndex((k) =>
        VUE_COMPONENTS_KEYS.includes(k),
      ) !== -1
    );
  }

  return false;
}
export interface PropDef {
  name: string;
  type?: any;
  required?: boolean;
  default?: any;
  validator?: (value: any) => boolean;
}

export function getPropDefs(component: any, props: PropDef[] = []) {
  if (component.extends) {
    getPropDefs(component.extends as any, props);
  }

  if (component.mixins && component.mixins.length > 0) {
    component.mixins.forEach((mixin: any) => {
      getPropDefs(mixin, props);
    });
  }

  if (Array.isArray(component.props)) {
    component.props
      .map((str) => ({ name: camelCase(str) }))
      .forEach((op) => {
        const i = props.findIndex((p) => p.name === op.name);
        if (i === -1) {
          props.push(op);
        } else {
          props[i] = op;
        }
      });
  } else if (isPlainObject(component.props)) {
    for (const key in component.props) {
      const val = component.props[key];
      const name = camelCase(key);
      const def = (
        isPlainObject(val) ? { ...val, name } : { name, type: val }
      ) as any;
      const i = props.findIndex((p) => p.name === name);
      if (i === -1) {
        props.push(def);
      } else {
        props[i] = def;
      }
    }
  }

  return props;
}

export function getEmitDefs(component: any, emits: string[] = []): string[] {
  if (component.extends) {
    getEmitDefs(component.extends as any, emits);
  }

  if (component.mixins && component.mixins.length > 0) {
    component.mixins.forEach((mixin: any) => {
      getEmitDefs(mixin, emits);
    });
  }

  if (Array.isArray(component.emits)) {
    emits.push(...component.emits);
  } else if (isPlainObject(component.emits)) {
    emits.push(...Object.keys(component.emits));
  }

  return emits;
}

export function getExposeDefs(
  component: any,
  exposes: string[] = [],
): string[] {
  if (component.extends) {
    getExposeDefs(component.extends as any, exposes);
  }

  if (component.mixins && component.mixins.length > 0) {
    component.mixins.forEach((mixin: any) => {
      getExposeDefs(mixin, exposes);
    });
  }

  if (Array.isArray(component.expose) && component.expose.length > 0) {
    exposes.push(...component.expose);
  }

  return exposes;
}
