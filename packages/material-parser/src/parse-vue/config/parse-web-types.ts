import { readJSONSync } from 'fs-extra';
import {
  MaterialComponent,
  MaterialComponentAttr,
  MaterialComponentEvent,
  MaterialComponentSlot,
  McUnionType,
} from '../../types/parse';
import {
  HtmlTag,
  HtmlTagAttribute,
  HtmlTagEvent,
  HtmlTagSlot,
  HtmlVueElement,
} from './types';
import { normalizeDefaultValue, normalizeName, transformType } from './utils';
import { camelCase, upperFirst } from 'lodash';
// import { camelCase, upperFirst } from 'lodash';

function getTags(webTypeJSON: any): HtmlTag[] {
  if (
    webTypeJSON.contributions &&
    webTypeJSON.contributions.html &&
    Array.isArray(webTypeJSON.contributions.html.tags) &&
    webTypeJSON.contributions.html.tags.length > 0
  ) {
    return webTypeJSON.contributions.html.tags;
  }

  if (
    webTypeJSON.contributions &&
    webTypeJSON.contributions.html &&
    Array.isArray(webTypeJSON.contributions.html['vue-components'])
  ) {
    return webTypeJSON.contributions.html['vue-components'];
  }

  return [];
}

function resolveAttrs(tag: HtmlTag & HtmlVueElement): MaterialComponentAttr[] {
  let attrs: HtmlTagAttribute[] = [];

  if (Array.isArray(tag.attributes) && tag.attributes.length > 0) {
    attrs = tag.attributes;
  } else if (Array.isArray(tag.props) && tag.props.length > 0) {
    attrs = tag.props;
  }

  const VMODEL_PREFIX = 'v-model:';
  const VMODEL_SUFFIX = '(v-model)';

  return attrs.map((attr) => {
    let name = attr.name;
    let sync;
    if (attr.name.endsWith(VMODEL_SUFFIX)) {
      name = attr.name.substring(0, attr.name.indexOf(VMODEL_SUFFIX));
      sync = true;
    } else if (attr.name.startsWith(VMODEL_PREFIX)) {
      name = attr.name.substring(VMODEL_PREFIX.length);
      sync = true;
    } else if (
      ['value', 'model-value', 'modelValue'].includes(attr.name) ||
      (attr.description &&
        (attr.description.includes('.sync') ||
          attr.description.includes('v-model')))
    ) {
      sync = true;
    }

    let type = transformType(
      attr.type || (attr.value as { type: string })?.type,
    );

    let options: MaterialComponentAttr['options'] = [];
    if (
      type.type === 'union' &&
      (type as McUnionType).value.every((n) => typeof n === 'string')
    ) {
      options = (type as McUnionType).value.map((n: any) => ({
        label:
          n.startsWith('"') && n.endsWith('"')
            ? n.substring(1, n.length - 1)
            : n,
        value: n,
      }));
    }

    if (attr.values && attr.values.length > 0) {
      options = attr.values.map(({ name }) => {
        return {
          label: name,
          value:
            attr['attribute-value'] &&
            attr['attribute-value'].type === 'of-match'
              ? name
              : JSON.stringify(name),
        };
      });
      type = {
        type: 'union',
        value: options.map(({ value }) => value),
      } as McUnionType;
    }

    return {
      name: normalizeName(name),
      description: attr.description,
      type: type,
      defaultValue: normalizeDefaultValue(attr.default),
      options,
      sync,
    } as MaterialComponentAttr;
  });
}

function resolveEvents(
  tag: HtmlTag & HtmlVueElement,
): MaterialComponentEvent[] {
  let events: HtmlTagEvent[] = [];

  if (Array.isArray(tag.events) && tag.events.length > 0) {
    events = tag.events;
  } else if (tag.js && Array.isArray(tag.js.events)) {
    events = tag.js.events;
  }

  return events.map((event) => {
    return {
      name: normalizeName(event.name),
      description: event.description,
      params: (event.arguments || []).map((arg) => {
        return {
          name: arg.name,
          description: arg.description,
          type: transformType(arg.type),
        };
      }),
    } as MaterialComponentEvent;
  });
}

function resolveSlots(tag: HtmlTag & HtmlVueElement): MaterialComponentSlot[] {
  let slots: HtmlTagSlot[] = [];

  if (Array.isArray(tag.slots)) {
    slots = tag.slots;
  }

  return slots.map((slot) => {
    return {
      name: normalizeName(slot.name),
      description: slot.description,
      params: (slot['vue-properties'] || []).map((p) => ({
        name: p.name,
        description: p.description,
        type: transformType(p.type),
      })),
    } as MaterialComponentSlot;
  });
}

export function parseWebTypes(filePath: string): MaterialComponent[] {
  const webTypeJSON = readJSONSync(filePath);

  const tags = getTags(webTypeJSON);

  return tags.map((tag) => {
    return {
      name: tag.name.includes('-') ? upperFirst(camelCase(tag.name)) : tag.name,
      description: tag.description,
      attrs: resolveAttrs(tag),
      events: resolveEvents(tag),
      slots: resolveSlots(tag),
      methods: [],
    } as MaterialComponent;
  });
}
