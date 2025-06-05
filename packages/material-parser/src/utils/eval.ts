import originalSafeEval from 'safe-eval';
import { isPlainObject } from 'lodash';

function isPrimitive(val) {
  return !['object', 'function'].includes(typeof val) || val === null;
}

export function safeEval(value: any) {
  if (typeof value === 'string') return originalSafeEval(value);
  return value;
}

export function isEvaluable(value) {
  if (isPrimitive(value)) return true;
  if (Array.isArray(value)) {
    return value.every(isEvaluable);
  } else if (isPlainObject(value)) {
    return Object.keys(value).every((key) => isEvaluable(value[key]));
  }
  return false;
}
