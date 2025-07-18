import { namedTypes as t, NodePath } from 'ast-types';
import isVueDefineComponent from '../utils/isVueDefineComponent';
import isVueExtend from '../utils/isVueExtend';
/**
 * If the path is a call expression, it recursively resolves to the
 * rightmost argument, stopping if it finds a React.createClass call expression
 *
 * Else the path itself is returned.
 */
export default function resolveHOC(path: NodePath): NodePath {
  const { node } = path;
  if (
    t.CallExpression.check(node) &&
    !isVueDefineComponent(path) &&
    !isVueExtend(path)
  ) {
    if (node.arguments.length) {
      const inner = path.get('arguments', 0);

      // If the first argument is one of these types then the component might be the last argument
      // If there are all identifiers then we cannot figure out exactly and have to assume it is the first
      if (
        node.arguments.length > 1 &&
        (t.Literal.check(inner.node) ||
          t.ObjectExpression.check(inner.node) ||
          t.ArrayExpression.check(inner.node) ||
          t.SpreadElement.check(inner.node))
      ) {
        return resolveHOC(
          // resolveToValue(path.get('arguments', node.arguments.length - 1)),
          path.get('arguments', node.arguments.length - 1),
        );
      }

      // return resolveHOC(resolveToValue(inner));
      return resolveHOC(inner);
    }
  }

  return path;
}
