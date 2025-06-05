import { readFileSync } from 'fs-extra';
import { visit } from 'recast';
import pathUtils from 'path';

import buildParse from '../js/babel-parser';
import { requireInSandbox } from '../sandbox';
import { MaterialScanMeta } from '../../types/parse';

const { parse } = buildParse();

export async function parseCJSExports(filePath: string) {
  const modules = await requireInSandbox(filePath);
  return Object.keys(modules);
}

export function parseESExports(filePath: string) {
  const content = readFileSync(filePath, 'utf-8');
  const ast = parse(content.toString());

  const exportNames: string[] = [];

  visit(ast.program, {
    visitExportAllDeclaration(path) {
      if (path.node.source.type === 'StringLiteral') {
        const importPath = pathUtils.resolve(
          filePath,
          '../',
          path.node.source.value,
        );
        exportNames.push(...parseESExports(importPath));
      }

      return false;
    },
    visitExportNamedDeclaration(path) {
      if (
        path.node.declaration &&
        path.node.declaration.type === 'VariableDeclaration'
      ) {
        exportNames.push(
          ...path.node.declaration.declarations
            .filter(
              (d) =>
                d.type === 'VariableDeclarator' && d.id.type === 'Identifier',
            )
            .map((d: any) => d.id.name),
        );
      } else if (path.node.specifiers) {
        exportNames.push(
          ...path.node.specifiers.map((s) => s.exported.name as string),
        );
      }

      return false;
    },
    visitExportDefaultDeclaration(path) {
      exportNames.push('default');
      return false;
    },
  });

  return exportNames;
}

export default async function (args: MaterialScanMeta) {
  if (args.moduleFileAbsolutePath) {
    return parseESExports(args.moduleFileAbsolutePath);
  }

  return parseCJSExports(args.mainFileAbsolutePath);
}
