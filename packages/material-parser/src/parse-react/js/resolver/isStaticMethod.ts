import { namedTypes as t } from 'ast-types';
import isReactComponentStaticMember from './isReactComponentStaticMember';
import { utils as ReactDocgenUtils } from '../../../react-docgen/main.js';

const { isReactComponentMethod } = ReactDocgenUtils;

/**
 * judge if static method
 */
function isStaticMethod(path: any) {
  const isProbablyStaticMethod =
    t.ClassProperty.check(path.node) && path.node.static === true;

  return (
    isProbablyStaticMethod &&
    !isReactComponentStaticMember(path) &&
    !isReactComponentMethod(path)
  );
}

export default isStaticMethod;
