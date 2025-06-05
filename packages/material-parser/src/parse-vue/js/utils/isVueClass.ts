import { namedTypes as t, NodePath } from 'ast-types';
import { utils as ReactDocgenUtils } from '../../../react-docgen/main';

const {
  resolveToModule,
  resolveToValue,
} = ReactDocgenUtils;

export default function isVueClass(path: NodePath) {
  const { node } = path;

  if (!t.ClassDeclaration.check(node) && !t.ClassExpression.check(node)) {
    return false;
  }

  // extends something
  if (!node.superClass) {
    return false;
  }

  const superClass = resolveToValue(path.get('superClass'));
  const moduleName = resolveToModule(superClass);

  return moduleName === 'vue';
}
