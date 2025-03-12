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
