import * as bt from '@babel/types';
import { NodePath } from 'ast-types/lib/node-path';
import resolveRequired from '../utils/resolveRequired';
import documentRequiredComponents from '../utils/documentRequiredComponents';
import getProperties from './utils/getProperties';
import resolveLocal from '../utils/resolveLocal';
import { ScriptHandler } from '../types';

/**
 * Look in the mixin section of a component.
 * Parse the file mixins point to.
 * Add the necessary info to the current doc object.
 * Must be run first as mixins do not override components.
 */
const mixinHandler: ScriptHandler = async (
  documentation,
  componentDefinition,
  astPath,
  opt,
  deps,
) => {
  // filter only mixins
  const mixinVariableNames = getMixinsVariableNames(componentDefinition);

  if (!mixinVariableNames || !mixinVariableNames.length) {
    return;
  }

  const variablesResolvedToCurrentFile = resolveLocal(
    astPath,
    mixinVariableNames,
  );

  // get require / import statements for mixins
  const mixinVarToFilePath = resolveRequired(astPath, mixinVariableNames);

  await mixinVariableNames.reduce(async (_, varName) => {
    await _;
    if (variablesResolvedToCurrentFile.get(varName)) {
      await deps.addDefaultAndExecuteHandlers(
        variablesResolvedToCurrentFile,
        astPath,
        {
          ...opt,
          nameFilter: [varName],
        },
        deps,
        documentation,
      );
    } else {
      // get each doc for each mixin using parse
      await documentRequiredComponents(
        deps.parseFile,
        documentation,
        mixinVarToFilePath,
        'mixin',
        {
          ...opt,
          nameFilter: [varName],
        },
      );
    }

    return;
  }, Promise.resolve());
};

export default mixinHandler;

function getMixinsVariableNames(compDef: NodePath): string[] {
  const varNames: string[] = [];
  if (bt.isObjectExpression(compDef.node)) {
    const mixinProp = getProperties(compDef, 'mixins');

    const mixinPath = mixinProp.length
      ? (mixinProp[0] as NodePath<bt.Property>)
      : undefined;

    if (mixinPath) {
      const mixinPropertyValue =
        mixinPath.node.value && bt.isArrayExpression(mixinPath.node.value)
          ? mixinPath.node.value.elements
          : [];
      mixinPropertyValue.forEach((e: bt.Node | null) => {
        if (!e) {
          return;
        }
        if (bt.isCallExpression(e)) {
          e = e.callee;
        }
        if (bt.isIdentifier(e)) {
          varNames.push(e.name);
        }
      });
    }
  } else if (
    bt.isClassDeclaration(compDef.node) &&
    compDef.node.superClass &&
    bt.isCallExpression(compDef.node.superClass) &&
    bt.isIdentifier(compDef.node.superClass.callee) &&
    compDef.node.superClass.callee.name.toLowerCase() === 'mixins'
  ) {
    return compDef.node.superClass.arguments.reduce((acc: string[], a) => {
      if (bt.isIdentifier(a)) {
        acc.push(a.name);
      }
      return acc;
    }, []);
  }
  return varNames;
}
