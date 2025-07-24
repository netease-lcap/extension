import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { glob, readFile } from './utils/file-system';
import transformFunc2NaslLogic from './transforms/transform-func2nasl-logic';

export default async function getNaslExtensionConfig(rootPath: string) {
  const logicDir = 'src/logics';
  const tsFiles = await glob(`${logicDir}/**/*.ts`, { cwd: rootPath, absolute: true });
  const logics: any[] = [];

  for (const tsPath of tsFiles) {
    if (tsPath.endsWith('api.ts')) {
      return;
    }

    const code = await readFile(tsPath, 'utf-8');
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      ExportNamedDeclaration(p) {
        const logic = transformFunc2NaslLogic(p.node);
        if (logic) {
          logics.push(logic);
        }
      },
    });
  };

  return logics;
}
