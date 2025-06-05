import { namedTypes as t } from 'ast-types';
import { utils as ReactDocgenUtils } from '../../../react-docgen/main.js';

const { getPropertyName } = ReactDocgenUtils;

const reactStaticMembers = ['propTypes', 'defaultProps', 'contextTypes'];
export default function isReactComponentStaticMember(methodPath: any) {
  let name;
  if (t.MemberExpression.check(methodPath.node)) {
    name = methodPath.node.property.name;
  } else {
    name = getPropertyName(methodPath);
  }
  return !!name && reactStaticMembers.indexOf(name) !== -1;
}
