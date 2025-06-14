import { namedTypes as t } from 'ast-types';
import isReactComponentStaticMember from './isReactComponentStaticMember';
import { utils as ReactDocgenUtils } from '../../../react-docgen/main.js';
import { traverseShallow } from '../../../react-docgen/utils/traverse';

const { match } = ReactDocgenUtils;

function findAssignedMethods(scope: any, idPath: any) {
  const results: any[] = [];

  if (!t.Identifier.check(idPath.node)) {
    return results;
  }

  const { name } = idPath.node;
  // const idScope = idPath.scope.lookup(idPath.node.name);

  traverseShallow(scope.path, {
    visitAssignmentExpression(path: any) {
      const { node } = path;
      if (
        match(node.left, {
          type: 'MemberExpression',
          object: { type: 'Identifier', name },
        })
        // && path.scope.lookup(name) === idScope
      ) {
        results.push(path);
        return false;
      }
      return this.traverse(path);
    },
  });

  return results.filter((x) => !isReactComponentStaticMember(x.get('left')));
}

export default findAssignedMethods;
