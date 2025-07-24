import path from 'node:path';
import { exists, readFile, rm, writeFile } from './file-system';
import { getComponentMetaInfos } from './api-meta';
import * as parser from '@babel/parser';
import generator from '@babel/generator';
import traverse from '@babel/traverse';

export async function removeComponentFiles(rootPath: string, name: string) {
  const components = await getComponentMetaInfos(rootPath, true);

  const compMeta = components.find((c) => c.name === name);

  if (!compMeta) {
    throw new Error(`未找到组件 ${name}`);
  }

  const componentFolder = path.dirname(compMeta.tsPath);
  const componentFolderName = path.basename(componentFolder);
  let exportsFilePath = '';

  for (const fileName of ['index.ts', 'index.js']) {
    const filePath = path.resolve(componentFolder, '../', fileName);
    if (await exists(filePath)) {
      exportsFilePath = filePath;
      break;
    }
  }

  if (!exportsFilePath) {
    return;
  }

  const code = await readFile(exportsFilePath, 'utf-8');
  const source = `./${componentFolderName}`;

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const removeNames = [name];

  traverse(ast, {
    ExportNamedDeclaration(path) {
      if (path.node.source && path.node.source.value === source) {
        path.remove();
      }
    },
    ImportDeclaration(path) {
      if (path.node.source && path.node.source.value === source) {
        path.traverse({
          ImportSpecifier(p) {
            if (p.node.local.name === name) {
              removeNames.push(p.node.local.name);
            }
          },
        });

        path.remove();
      }
    },
    ExportAllDeclaration(path) {
      if (path.node.source && path.node.source.value === source) {
        path.remove();
      }
    },
    ExportSpecifier(path) {
      if (removeNames.includes(path.node.local.name)) {
        path.remove();
      }
    },
  });

  await rm(componentFolder);
  await writeFile(exportsFilePath, generator(ast).code, 'utf-8');
}
