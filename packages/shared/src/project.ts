import path from 'node:path';
import { readJSON, exists } from './utils/file-system';
import { ExtensionProjectInfo } from './types/project';

export function resolveFramework(pkgInfo: any) {
  if (pkgInfo.peerDependencies && Object.keys(pkgInfo.peerDependencies).includes('@tarojs/taro')) {
    return 'taro';
  }

  if (pkgInfo.peerDependencies && Object.keys(pkgInfo.peerDependencies).includes('react')) {
    return 'react';
  }

  if (
    pkgInfo.peerDependencies
    && pkgInfo.peerDependencies.vue
    && (pkgInfo.peerDependencies.vue.startsWith('3.') || pkgInfo.peerDependencies.vue.startsWith('^3.'))
  ) {
    return 'vue3';
  }

  if (
    pkgInfo.peerDependencies
    && pkgInfo.peerDependencies.vue
    && (pkgInfo.peerDependencies.vue.startsWith('2.') || pkgInfo.peerDependencies.vue.startsWith('^2.'))
  ) {
    return 'vue2';
  }

  return 'unknown';
}

const LCAP_UI = 'lcap-ui';
export function getLcapUIInfo(pkgInfo: any) {
  if (!pkgInfo || !pkgInfo.lcap || !pkgInfo.lcap[LCAP_UI]) {
    return null;
  }

  return pkgInfo.lcap[LCAP_UI];
}


export async function getProjectInfo(rootPath: string) {
  const pkg = await readJSON(path.resolve(rootPath, 'package.json'));

  const schemaFilePath = pkg.lcap && pkg.lcap.schema ? path.resolve(rootPath, pkg.lcap.schema) : '';

  const projectInfo: ExtensionProjectInfo = {
    framework: resolveFramework(pkg),
    name: pkg.name,
    version: pkg.version,
    title: pkg.title,
    description: pkg.description,
    libUIInfo: getLcapUIInfo(pkg),
    schemaFilePath,
  };

  return projectInfo;
}

const LCAP_UI_JSON_PATH = '.lcap/lcap-ui/lcap-module.json';
const LCAP_UI_CONFIG_PATH = '.lcap/lcap-ui/runtime/nasl.ui.json';

export async function getLcapUIComponentList(rootPath: string) {
  const projectInfo = await getProjectInfo(rootPath);

  if (!projectInfo.libUIInfo) {
    return [];
  }

  const moduleConfigPath = path.resolve(rootPath, LCAP_UI_JSON_PATH);
  if (!(await exists(moduleConfigPath))) {
    return [];
  }

  try {
    const naslConfigPath = path.resolve(rootPath, LCAP_UI_CONFIG_PATH);

    if (!(await exists(naslConfigPath))) {
      return [];
    }

    const arr = await readJSON(naslConfigPath);
    return Array.isArray(arr) ? arr.filter((c) => c.show !== false).sort((a, b) => a.name.localeCompare(b.name)) : [];
  } catch (e) {
    return [];
  }
}

export async function getSourceSchema(rootPath: string) {
  const projectInfo = await getProjectInfo(rootPath);

  if (!projectInfo.schemaFilePath || !(await exists(projectInfo.schemaFilePath))) {
    return null;
  }

  const schema = await readJSON(projectInfo.schemaFilePath);
  return schema;
}
