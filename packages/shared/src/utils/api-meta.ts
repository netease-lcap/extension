import path from 'path';
import * as babelTypes from '@babel/types';
import traverse from '@babel/traverse';
import { upperFirst, camelCase, isNil } from 'lodash-es';
import { glob, readFile } from './file-system';
import type { ComponentMetaInfo } from '../types/nasl';
import { babelParser, evalOptions } from './babel-utils';
import logger from './logger';
import { getKebabCaseName } from './string';

export const getComponentMetaByApiTs = async (tsPath: string) => {
  const tsCode = await readFile(tsPath, 'utf-8');
  const ast = babelParser.parse(tsCode) as babelTypes.File;

  let metaInfo: ComponentMetaInfo | undefined;

  traverse(ast, {
    ClassDeclaration(p) {
      if (
        !p.node.superClass
        || !p.node.id
        || p.node.id.type !== 'Identifier'
        || p.node.superClass.type !== 'Identifier'
        || p.node.superClass.name !== 'ViewComponent'
      ) {
        return;
      }

      const compMetaInfo: ComponentMetaInfo = {
        name: p.node.id.name,
        kebabName: getKebabCaseName(p.node.id.name),
        tsPath,
      };

      (p.node.decorators as any[]).forEach((decorator) => {
        if (
          decorator.expression.type === 'CallExpression'
          && ['Component', 'ExtensionComponent', 'IDEExtraInfo'].includes((decorator.expression.callee as babelTypes.Identifier).name)
        ) {
          decorator.expression.arguments.forEach((arg) => {
            if (arg.type === 'ObjectExpression') {
              const config = evalOptions(arg) || {};
              ['title', 'show', 'group', 'icon', 'type', 'sourceName'].forEach((key) => {
                if (!isNil(config[key])) {
                  compMetaInfo[key] = config[key];
                }
              });
            }
          });
        }
      });

      if (metaInfo) {
        if (!metaInfo.children) {
          metaInfo.children = [];
        }

        metaInfo.children.push(compMetaInfo);
      } else {
        metaInfo = compMetaInfo;
      }
    },
  });

  return metaInfo;
};

export async function getComponentMetaInfos(rootPath: string, parseAPI: boolean = false) {
  const metaInfos: ComponentMetaInfo[] = [];
  const files = await glob('src/**/api.ts', { cwd: rootPath, absolute: true });
  files.forEach((apiPath) => {
    const basename = path.dirname(apiPath);

    metaInfos.push({
      name: upperFirst(camelCase(basename)),
      tsPath: apiPath,
    });
  });

  const clearIndexs: number[] = [];

  if (parseAPI) {
    for (let i = 0; i < metaInfos.length; i += 1) {
      const { tsPath } = metaInfos[i];
      try {
        const componentMeta = await getComponentMetaByApiTs(tsPath);
        if (componentMeta) {
          metaInfos[i] = {
            ...metaInfos[i],
            ...componentMeta,
          };
        } else {
          clearIndexs.push(i);
        }
      } catch (e) {
        logger.error(`解析组件 ${tsPath} 失败`);
        clearIndexs.push(i);
      }
    }
  }

  return metaInfos.filter((_, index) => !clearIndexs.includes(index)) as ComponentMetaInfo[];
}
