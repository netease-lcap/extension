import json5 from 'json5';
import { upperFirst } from "lodash";

const eventRegex = /^on[A-Z].*/;
const slotRegex = /^slot[A-Z].*/;

export function normalizeEventName(name: string) {
  if (eventRegex.test(name)) {
    return name;
  }

  return `on${upperFirst(name)}`;
}

export function normalizeSlotName(name: string) {
  if (slotRegex.test(name) || name.startsWith('slot-')) {
    return name;
  }

  return name.includes('-') ? `slot-${name}` : `slot${upperFirst(name)}`;
}

export function formatInputValue(value: string) {
  if (!value) {
    return '';
  }

  if (/^'|".*'|"$/.test(value)) {
    return value.substring(1, value.length - 1);
  }

  return JSON.stringify(json5.parse(value));
}

export function getInputValueStringify(value?: string) {
  if (!value) {
    return '';
  }

  try {
    return JSON.stringify(json5.parse(value));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return JSON.stringify(value);
  }
}