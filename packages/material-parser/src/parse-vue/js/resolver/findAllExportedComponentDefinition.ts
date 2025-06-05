import * as bt from '@babel/types';
import Map from 'ts-map';
import { namedTypes as t } from 'ast-types';
import { visit } from 'recast';
import { NodePath } from 'ast-types/lib/node-path';
import { utils as ReactDocgenUtils } from '../../../react-docgen/main';
import checkIsIIFE from '../../../parse-react/js/resolver/checkIsIIFE';
import resolveIIFE from '../../../parse-react/js/resolver/resolveIIFE';
import resolveImport from './resolveImport';
import resolveExportDeclaration from '../../../parse-react/js/resolver/resolveExportDeclaration';
import { get, set, has, ICache } from '../../../parse-react/js/utils/cache';
import makeProxy from '../../../parse-react/js/utils/makeProxy';
import * as expressionTo from '../../../react-docgen/utils/expressionTo';
import isVueOptions from '../utils/isVueOptions';
import isVueClass from '../utils/isVueClass';
import isVueDefineComponent from '../utils/isVueDefineComponent';
import isVueExtend from '../utils/isVueExtend';
import resolveHOC from './resolveHOC';

const {
  isExportsOrModuleAssignment,
  resolveToValue,
} = ReactDocgenUtils;

function ignore(): boolean {
  return false;
}

function isComponentDefinition(path: NodePath): boolean {
  return (
    isVueOptions(path)
    || isVueClass(path)
    || isVueExtend(path)
    || isVueDefineComponent(path)
  );
}

function resolveDefinition(definition: NodePath): NodePath {
  if (isVueExtend(definition) || isVueDefineComponent(definition)) {
    return resolveToValue(definition.get('arguments', 0));
  }

  return definition;
}

function getDefinition(definition: any, cache: ICache = {}): any {
  const { __meta: exportMeta = {} } = definition;

  if (isComponentDefinition(definition)) {
    return definition;
  }

  switch (true) {
    case checkIsIIFE(definition):
      definition = resolveToValue(resolveIIFE(definition));
      break;
    case t.CallExpression.check(definition.node):
      definition = resolveToValue(resolveHOC(definition));
      break;
    case t.SequenceExpression.check(definition.node):
      const classNameNode = definition.parent.get('id').node;
      const localNames: string[] = [];
      let { node } = definition.get('expressions', 0);
      while (t.AssignmentExpression.check(node)) {
        // @ts-ignore
        const { name } = node.left;
        if (name) {
          localNames.push(name);
        }
        node = node.right;
      }
      definition.get('expressions').each((x: any) => {
        if (!x.name) return;
        if (t.AssignmentExpression.check(x.node) && t.MemberExpression.check(x.node.left)) {
          const objectName = x.node.left.object.name;
          if (localNames.includes(objectName)) {
            x.get('left', 'object').replace(classNameNode);
          }
        }
      });
      definition = resolveToValue(definition.get('expressions').get(0));
      break;
    default:
      definition = resolveToValue(definition);
      if (definition && (!definition.__meta || Object.keys(definition.__meta).length === 0)) {
        definition.__meta = exportMeta;
      }
      return resolveImport(definition, (ast: any, sourcePath: string, importMeta, mode) => {
        let result;
        if (has('ast-export', ast.__path)) {
          result = get('ast-export', ast.__path);
        } else {
          result = findAllExportedComponentDefinition(ast);
          set('ast-export', ast.__path, result);
        }

        const exportList: any[] = [];
        const importList: any[] = [];
        result.forEach((def: any) => {
          const { __meta: meta = {} } = def;
          let { exportName } = meta;

          for (const item of importMeta) {
            if (exportName === item.importedName) {
              exportName = item.localName;
              break;
            }
          }

          if (exportName) {
            importList.push(makeProxy(def, { __meta: { exportName } }));
          }

          const nextMeta: any = {
            exportName,
          };

          if (exportName === exportMeta.localName) {
            nextMeta.exportName = exportMeta.exportName;
          } else if (mode === 'import') {
            return;
          }

          if (exportMeta.subName) {
            nextMeta.subName = exportMeta.subName;
          } else if (meta.subName) {
            nextMeta.subName = meta.subName;
          }
          exportList.push(makeProxy(def, { __meta: nextMeta }));
        });
        cache[sourcePath] = importList;

        return exportList;
      });
  }

  if (definition && (!definition.__meta || Object.keys(definition.__meta).length === 0)) {
    definition.__meta = exportMeta;
  }

  return getDefinition(definition, cache);
}

function findAllExportedComponentDefinition(ast: bt.Program): Array<NodePath> {
  const components: NodePath[] = [];
  const cache: ICache = {};

  function exportDeclaration(path: NodePath) {
    const definitions = resolveExportDeclaration(path)
      .reduce((acc: any[], definition: any) => {
        if (isComponentDefinition(definition)) {
          acc.push(definition);
        } else {
          definition = getDefinition(definition, cache);

          if (!Array.isArray(definition)) {
            definition = [definition];
          }
          definition.forEach((def: any) => {
            if (isComponentDefinition(def)) {
              acc.push(def);
            }
          });
        }
        return acc;
      }, [])
      .map((definition: any) => {
        const { __meta: meta } = definition;
        const def = resolveDefinition(definition);
        return makeProxy(def, { __meta: meta });
      });

    if (definitions.length === 0) {
      return false;
    }

    definitions.forEach((definition: any) => {
      if (definition && components.indexOf(definition) === -1) {
        components.push(definition);
      }
    });

    return false;
  }

  visit(ast, {
    visitFunctionDeclaration: ignore,
    visitFunctionExpression: ignore,
    visitClassDeclaration: ignore,
    visitClassExpression: ignore,
    visitIfStatement: ignore,
    visitWithStatement: ignore,
    visitSwitchStatement: ignore,
    visitWhileStatement: ignore,
    visitDoWhileStatement: ignore,
    visitForStatement: ignore,
    visitForInStatement: ignore,
    visitForOfStatement: ignore,
    visitImportDeclaration: ignore,

    visitExportNamedDeclaration: exportDeclaration,
    visitExportDefaultDeclaration: exportDeclaration,
    visitExportAllDeclaration(path) {
      components.push(...resolveImport(path, findAllExportedComponentDefinition));
      return false;
    },

    visitAssignmentExpression(path: any) {
      // Ignore anything that is not `exports.X = ...;` or
      // `module.exports = ...;`
      if (!isExportsOrModuleAssignment(path)) {
        return false;
      }
      const arr = expressionTo.Array(path.get('left'));
      const meta: any = {
        exportName: arr[1] === 'exports' ? 'default' : arr[1],
      };
      // Resolve the value of the right hand side. It should resolve to a call
      // expression, something like React.createClass
      path = resolveToValue(path.get('right'));
      if (!isComponentDefinition(path)) {
        path = getDefinition(path, cache);
      }

      if (!Array.isArray(path)) {
        path = [path];
      }

      const definitions = path.map(resolveDefinition);

      definitions.forEach((definition: any) => {
        if (definition && components.indexOf(definition) === -1) {
          // if (definition.__meta) {
          definition = makeProxy(definition, {
            __meta: meta,
          });
          // }
          components.push(definition);
        }
      });
      return false;
    },
  });

  return components;
};

export default (ast: bt.Program) => {
  const components = findAllExportedComponentDefinition(ast);
  const componentsMap = new Map<string, NodePath>();

  components.forEach((comp) => {
    const { __meta: exportMeta = {} } = comp as any;
    componentsMap.set(exportMeta.exportName, comp);
  });

  return componentsMap;
}
