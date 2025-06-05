import { readJSONSync } from 'fs-extra';
import { VeturTag, VeturTagAttribute } from './types';
import {
  MaterialComponent,
  MaterialComponentAttr,
  McUnionType,
} from '../../types/parse';
import { normalizeName, transformType } from './utils';
import { upperFirst } from 'lodash';

const VMODEL_PREFIX = 'v-model:';
const VMODEL_SUFFIX = '(v-model)';

export function parseVetur(
  veturTagFileAbsolutePath: string,
  veturAttributesFileAbsolutePath: string,
): MaterialComponent[] {
  const tagMap: Record<string, VeturTag> = readJSONSync(
    veturTagFileAbsolutePath,
  );
  const attrMap: Record<string, VeturTagAttribute> = readJSONSync(
    veturAttributesFileAbsolutePath,
  );

  return Object.keys(tagMap).map((tagName) => {
    const component: MaterialComponent = {
      name: upperFirst(normalizeName(tagName)),
      description: '',
      attrs: [],
      events: [],
      slots: [],
      methods: [],
    };

    const { attributes } = tagMap[tagName];

    attributes.map((attrName) => {
      const key = `${tagName}/${attrName}`;
      if (!attrMap[key]) {
        return;
      }
      const { description, type, options } = attrMap[key];

      if (!type) {
        return;
      }

      if (description) {
        component.description = description;
      }

      if (type === 'event') {
        component.events.push({
          name: normalizeName(attrName),
          description: description || '',
          params: [],
        });

        return;
      }

      if (type === 'slot') {
        component.slots.push({
          name: normalizeName(attrName),
          description: description || '',
          params: [],
        });

        return;
      }

      let name = attrName;
      let sync;
      if (attrName.endsWith(VMODEL_SUFFIX)) {
        name = attrName.substring(0, attrName.indexOf(VMODEL_SUFFIX));
        sync = true;
      } else if (attrName.startsWith(VMODEL_PREFIX)) {
        name = attrName.substring(VMODEL_PREFIX.length);
        sync = true;
      } else if (
        ['value', 'model-value', 'modelValue'].includes(attrName) ||
        (description &&
          (description.includes('.sync') || description.includes('v-model')))
      ) {
        sync = true;
      }

      const compAttr: MaterialComponentAttr = {
        name: normalizeName(name),
        description: description || '',
        type: transformType(type),
        sync,
      };

      if (Array.isArray(options) && options.length > 0) {
        compAttr.options = [];
        compAttr.type = {
          type: 'union',
          value: [],
        };
        options.forEach((n) => {
          let val = n;
          if (type.toLowerCase() === 'string') {
            val = JSON.stringify(n);
          }

          compAttr.options?.push({
            value: val,
            label: n,
          });

          (compAttr.type as McUnionType).value.push(val);
        });
      }

      component.attrs.push(compAttr);
    });

    return component;
  });
}
