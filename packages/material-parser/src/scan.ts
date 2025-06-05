import * as fs from 'fs-extra';
import path from 'path';
import { MaterialScanMeta } from './types/parse';
import { resolveFramework, resolvePkgJSON } from './utils/meta';

export async function parseMeta(root: string): Promise<MaterialScanMeta> {
  const scanMeta: MaterialScanMeta = {
    workDir: process.cwd(),
    moduleDir: root,
    pkgName: '',
    pkgVersion: '',
    mainFileAbsolutePath: '',
    mainFilePath: '',
    framework: 'unknow',
  };
  const pkgJson = await resolvePkgJSON(path.join(root, 'package.json'));

  scanMeta.pkgName = pkgJson.name;
  scanMeta.pkgVersion = pkgJson.version;
  const framework = resolveFramework(pkgJson);
  scanMeta.framework = framework.name;
  scanMeta.frameworkVersion = framework.version;

  if (pkgJson.style && fs.existsSync(path.join(root, pkgJson.style))) {
    scanMeta.style = pkgJson.style;
  }

  if (pkgJson['web-types']) {
    const webTypeFileAbsolutePath = path.join(root, pkgJson['web-types']);
    if (fs.existsSync(webTypeFileAbsolutePath)) {
      scanMeta.webTypeFileAbsolutePath = webTypeFileAbsolutePath;
    }
  }

  if (pkgJson.vetur) {
    const veturTagFileAbsolutePath = pkgJson.vetur.tags
      ? path.join(root, pkgJson.vetur.tags)
      : '';
    const veturAttributesFileAbsolutePath = pkgJson.vetur.attributes
      ? path.join(root, pkgJson.vetur.attributes)
      : '';

    if (veturTagFileAbsolutePath && fs.existsSync(veturTagFileAbsolutePath)) {
      scanMeta.veturTagFileAbsolutePath = veturTagFileAbsolutePath;
    }

    if (
      veturAttributesFileAbsolutePath &&
      fs.existsSync(veturAttributesFileAbsolutePath)
    ) {
      scanMeta.veturAttributesFileAbsolutePath =
        veturAttributesFileAbsolutePath;
    }
  }

  if (pkgJson.description) {
    scanMeta.description = pkgJson.description;
  }

  if (pkgJson.module) {
    const moduleFileAbsolutePath = path.join(root, pkgJson.module);
    if (fs.existsSync(moduleFileAbsolutePath)) {
      scanMeta.moduleFilePath = pkgJson.module;
      scanMeta.moduleFileAbsolutePath = moduleFileAbsolutePath;
    }
  }
  scanMeta.mainFilePath = pkgJson.main || './index.js';
  scanMeta.mainFileAbsolutePath =
    scanMeta.mainFileAbsolutePath || path.join(root, pkgJson.main);
  const typingsPathCandidates = [
    pkgJson.typings,
    pkgJson.types,
    './index.d.ts',
    './lib/index.d.ts',
  ];
  for (let i = 0; i < typingsPathCandidates.length; i++) {
    const typingsFilePath = typingsPathCandidates[i];
    if (!typingsFilePath) continue;
    const typingsFileAbsolutePath = path.join(root, typingsFilePath);
    if (fs.existsSync(typingsFileAbsolutePath)) {
      scanMeta.typingsFileAbsolutePath = typingsFileAbsolutePath;
      scanMeta.typingsFilePath = typingsFilePath;
      break;
    }
  }

  return scanMeta;
}
