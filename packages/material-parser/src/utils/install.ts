import { pathExists, writeFile } from 'fs-extra';
import * as path from 'path';
import spawn from 'cross-spawn-promise';
import { resolvePkgJSON } from './meta';

export async function isNPMInstalled(args: {
  workDir: string;
  moduleDir: string;
  npmClient?: string;
}) {
  return pathExists(path.join(args.workDir, 'node_modules'));
}

export async function isNPMModuleInstalled(
  args: { workDir: string; moduleDir: string; npmClient?: string },
  name: string,
) {
  const modulePkgJsonPath = path.resolve(
    args.workDir,
    'node_modules',
    name,
    'package.json',
  );
  return pathExists(modulePkgJsonPath);
}

export async function install(args: {
  workDir: string;
  moduleDir: string;
  npmClient?: string;
}) {
  if (await isNPMInstalled(args)) return;
  const { workDir, npmClient = 'npm' } = args;
  try {
    await spawn(npmClient, ['i'], { stdio: 'inherit', cwd: workDir } as any);
  } catch (e) {
    // TODO
  }
}

export async function installModule(
  args: { workDir: string; moduleDir: string; npmClient?: string },
  name: string,
) {
  if (await isNPMModuleInstalled(args, name)) return;
  const { workDir, npmClient = 'npm' } = args;
  try {
    await spawn(npmClient, ['i', name], {
      stdio: 'inherit',
      cwd: workDir,
    } as any);
  } catch (e) {
    // TODO
  }
}

function getFrameworkDependencies(framework: string, pkg: Record<string, any>) {
  const {
    dependencies = {},
    devDependencies = {},
    peerDependencies = {},
  } = pkg;
  const map = {
    ...dependencies,
    ...devDependencies,
    ...peerDependencies,
  };
  let result = {};
  switch (framework) {
    case 'react':
      result = {
        react: 'latest',
        'react-dom': 'latest',
        '@types/react': 'latest',
        '@types/react-dom': 'latest',
        'prop-types': 'latest',
        'parse-prop-types': 'latest',
      };
      break;
    case 'vue2':
      result = {
        vue: '2.6.12',
        'vue-i18n': '^8.28.2',
        'vue-router': '^3.1.2',
        // '@vue/composition-api': '^1.7.2',
      };
      break;
    case 'vue3':
      result = {
        vue: 'latest',
        'vue-router': 'latest',
        'vue-i18n': 'latest',
      };
      break;
    default:
      return {};
  }

  Object.keys(result).forEach((k) => {
    if (map[k]) {
      result[k] = map[k];
    }
  });
  return result;
}

export async function installPeerAndDeps(args: {
  workDir: string;
  moduleDir: string;
  npmClient?: string;
  framework: string;
}) {
  const { workDir, moduleDir, npmClient = 'npm' } = args;
  const modulePkgJsonPath = path.resolve(moduleDir, 'package.json');
  if (!(await pathExists(modulePkgJsonPath))) {
    return;
  }
  const pkgJsonPath = path.resolve(workDir, 'package.json');
  if (!(await pathExists(pkgJsonPath))) {
    return;
  }
  const modulePkgJson = await resolvePkgJSON(modulePkgJsonPath);
  const pkgJson = await resolvePkgJSON(pkgJsonPath);
  const { peerDependencies = {} } = modulePkgJson;
  pkgJson.dependencies = pkgJson.dependencies || {};
  pkgJson.dependencies = {
    ...getFrameworkDependencies(args.framework, modulePkgJson),
    ...pkgJson.dependencies,
    ...modulePkgJson.dependencies,
    ...peerDependencies,
    // ...devDependencies,
  };
  await writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  await spawn(npmClient, ['i'], { stdio: 'inherit', cwd: workDir } as any);
}

export async function syncTypeModules(args: {
  workDir: string;
  moduleDir: string;
  npmClient?: string;
}) {
  const { workDir, moduleDir, npmClient = 'npm' } = args;
  const pkgJsonPath = path.resolve(moduleDir, 'package.json');
  if (!(await pathExists(pkgJsonPath))) {
    return;
  }
  await installModule(args, 'typesync');
  await spawn(npmClient.replace('m', 'x'), ['typesync'], {
    stdio: 'inherit',
    cwd: workDir,
  } as any);
}
