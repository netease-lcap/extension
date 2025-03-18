import consola from 'consola';
import * as fs from 'fs-extra';
import {
  MaterialParseOptions,
  MaterialScanMeta,
  MaterialSchema,
} from './types/parse';
import parseReact, { resolveReactSchema } from './parse-react';
import parseVue from './parse-vue';
import { parseMeta } from './scan';
import localize from './localize';

export * from './types/parse';

export function resolveSchema(
  components: any[],
  scanMeta: MaterialScanMeta,
): MaterialSchema {
  const schema: MaterialSchema = {
    name: scanMeta.pkgName,
    version: scanMeta.pkgVersion,
    description: scanMeta.description || '',
    framework: scanMeta.framework,
    frameworkVersion: scanMeta.frameworkVersion,
    style: scanMeta.style,
    components: [],
  };

  schema.components = components.map((c) => {
    if (scanMeta.framework === 'react') {
      return resolveReactSchema(c);
    }

    return c;
  });

  return schema;
}

export async function parse(
  options: MaterialParseOptions,
): Promise<MaterialSchema> {
  consola.start(`生成临时目录...`);
  const { workDir, moduleDir } = await localize(options);
  consola.success(`目录 ${workDir}`);
  try {
    consola.start('解析基础信息....');
    const scanMeta = await parseMeta(moduleDir);

    consola.success(`解析成功`);
    consola.box(
      JSON.stringify(
        {
          name: scanMeta.pkgName,
          version: scanMeta.pkgVersion,
          framework: scanMeta.framework,
          frameworkVersion: scanMeta.frameworkVersion,
          mainFilePath: scanMeta.mainFilePath,
          moduleFilePath: scanMeta.moduleFilePath,
          typingsFilePath: scanMeta.typingsFilePath,
        },
        null,
        '  ',
      ),
    );

    scanMeta.workDir = workDir;
    scanMeta.moduleDir = moduleDir;
    scanMeta.npmClient = options.npmClient;

    let parseResult: any[] = [];
    switch (scanMeta.framework) {
      case 'react':
        parseResult = await parseReact(scanMeta);
        break;
      case 'vue2':
      case 'vue3':
        parseResult = await parseVue(scanMeta);
        break;
      default:
        consola.warn(
          `${options.name} 未找到适配的解析器, 框架: ${scanMeta.framework}`,
        );
        break;
    }

    if (parseResult.length > 0) {
      consola.success('解析成功！');
    } else {
      consola.warn(`${options.name} 未识别到任何组件`);
    }

    return resolveSchema(parseResult || [], scanMeta);
  } catch (e) {
    throw e;
  } finally {
    await fs.remove(workDir);
  }
}
