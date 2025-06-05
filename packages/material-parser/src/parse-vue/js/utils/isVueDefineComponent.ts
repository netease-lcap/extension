import { namedTypes as t, NodePath } from 'ast-types';
import { utils as ReactDocgenUtils } from '../../../react-docgen/main';
import isVueOptions from './isVueOptions';

const {
  resolveToValue,
} = ReactDocgenUtils;

export default function isVueDefineComponent(path: NodePath) {
  const { node } = path;
  if (!t.CallExpression.check(node)) {
    return false;
  }

  const value = resolveToValue(path.get('arguments', 0));

  return isVueOptions(value);
}
