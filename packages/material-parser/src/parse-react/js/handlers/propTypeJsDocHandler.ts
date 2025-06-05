/* eslint-disable no-param-reassign */
import { set, get } from 'lodash';
import parseJsDoc from '../../../react-docgen/utils/parseJsDoc';
import { utils as ReactDocgenUtils } from '../../../react-docgen/main.js';
import { debug } from '../../../utils/debug';

const log = debug.extend('parse:js');

const { getMemberValuePath, resolveToValue } = ReactDocgenUtils;

function getType(type = 'void') {
  const typeOfType = typeof type;
  if (typeOfType === 'string') {
    return typeOfType;
  } else if (typeOfType === 'object') {
    return get(type, 'name', 'void');
  }
  return 'void';
}

function generateRaw(params: any[] = [], returns = { type: 'void' }): string {
  const raw = `(${params
    .filter((x) => !!x)
    .map((x) => `${x.name}: ${getType(x.type)}`)
    .join(', ')}) => ${returns ? getType(returns.type) : 'void'}`;
  return raw;
}

function resolveDocumentation(documentation) {
  documentation._props.forEach((propDescriptor) => {
    const { description } = propDescriptor;
    if (description.includes('@') && propDescriptor?.type?.name === 'func') {
      const jsDoc = parseJsDoc(description) as any;
      propDescriptor.description = jsDoc.description;
      if (jsDoc.params) {
        set(propDescriptor, ['type', 'params'], jsDoc.params);
      }
      if (jsDoc.returns) {
        set(propDescriptor, ['type', 'returns'], jsDoc.returns);
      }
      try {
        const raw = generateRaw(jsDoc.params, jsDoc.returns);
        if (raw) {
          set(propDescriptor, ['type', 'raw'], raw);
        }
      } catch (e) {
        log(e);
      }
    }
  });
}

/**
 * Extract info from the propType jsdoc blocks. Must be run after
 * propDocBlockHandler.
 */
export default function propTypeJsDocHandler(documentation, path) {
  let propTypesPath = getMemberValuePath(path, 'propTypes');
  if (!propTypesPath) {
    return;
  }
  propTypesPath = resolveToValue(propTypesPath);
  if (!propTypesPath) {
    return;
  }

  resolveDocumentation(documentation);
}
