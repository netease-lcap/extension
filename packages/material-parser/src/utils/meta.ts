import semver from 'semver';
import { FrameworkType } from '../types/parse';
import { loadFile } from './fs';

type FrameworkResult = { name: FrameworkType | 'unknow'; version?: string };

function findModuleVersion(pkg: Record<string, any>, name: string) {
  if (pkg.peerDependencies && pkg.peerDependencies[name]) {
    return pkg.peerDependencies[name];
  }

  if (pkg.dependencies && pkg.dependencies[name]) {
    return pkg.dependencies[name];
  }

  return pkg.devDependencies && pkg.devDependencies[name];
}

function resolveReact(pkg: Record<string, any>): FrameworkResult | undefined {
  const v = findModuleVersion(pkg, 'react');
  if (v) {
    return {
      name: 'react',
      version: semver.minVersion(v)?.version,
    };
  }
}

function resolveVue3(pkg: Record<string, any>): FrameworkResult | undefined {
  const version = findModuleVersion(pkg, 'vue');
  const minVersion = version && semver.minVersion(version)?.version;
  if (minVersion && semver.major(minVersion) === 3) {
    return {
      name: 'vue3',
      version: minVersion,
    };
  }
}

function resolveVue2(pkg: Record<string, any>): FrameworkResult | undefined {
  const version = findModuleVersion(pkg, 'vue');
  const minVersion = version && semver.minVersion(version)?.version;
  if (minVersion && semver.major(minVersion) === 2) {
    return {
      name: 'vue2',
      version: minVersion,
    };
  }
}

export async function resolvePkgJSON(
  pkgJsonPath: string,
): Promise<{ [k: string]: any }> {
  const content = await loadFile(pkgJsonPath);
  const json = JSON.parse(content);
  return json;
}

export function resolveFramework(pkg: Record<string, any>): FrameworkResult {
  const resolves = [resolveReact, resolveVue2, resolveVue3];

  let result: FrameworkResult = {
    name: 'unknow',
  };

  while (resolves.length > 0) {
    const rs = resolves.shift()?.(pkg);
    if (rs) {
      result = rs;
      break;
    }
  }

  return result;
}
