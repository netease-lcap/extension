import spawn from 'cross-spawn-promise';
import { ensureDir, ensureFile, writeFile, existsSync, copyFileSync } from 'fs-extra';
import { join, resolve } from 'path';
import { uid } from 'uid';
import { debug } from './utils/debug';
import { snakeCase } from 'lodash';
import { MaterialParseOptions } from './types/parse';

const log = debug.extend('localize');
/**
 * 创建组件包
 *
 * @private
 * @param {{
 *     pkgName: string;
 *     pkgVersion: string;
 *   }} params
 * @returns {Promise<void>}
 * @memberof OnlineAccesser
 */
export async function createFakePackage(params: {
  workDir: string;
  pkgName: string;
  pkgVersion: string;
  isLocal?: boolean;
  file?: string;
  npmClient?: string;
}): Promise<void> {
  // 创建临时组件包
  const { workDir } = params;
  const pkgJsonFilePath = join(workDir, 'package.json');
  await ensureFile(pkgJsonFilePath);

  let versionTag = params.pkgVersion || 'latest';
  if (params.isLocal) {
    if (!params.file || !existsSync(params.file)) {
      throw new Error(`本地包路径不存在: ${params.file}`);
    }

    const tempFilePath = join(workDir, `${params.pkgName}-temp.tgz`);

    copyFileSync(params.file, tempFilePath);
    versionTag = tempFilePath;
  }

  await writeFile(
    pkgJsonFilePath,
    JSON.stringify(
      {
        name: snakeCase(`fake_${snakeCase(params.pkgName)}_parse`),
        version: params.pkgVersion || '0.0.0',
        private: true,
        dependencies: {
          [params.pkgName]: versionTag,
          typesync: 'latest',
        },
      },
      null,
      2,
    ),
  );

  // 安装依赖
  const npmClient = params.npmClient || 'npm';
  await spawn(npmClient, npmClient === 'pnpm' ? ['i', '-r'] : ['i'], {
    stdio: 'inherit',
    cwd: workDir,
  } as any);
}

/**
 * 创建临时目录
 *
 * @private
 * @returns {Promise<string>} 返回临时文件夹路径
 * @memberof LocalGenerator
 */
export async function createWorkDir(tempDir?: string): Promise<string> {
  const workDirName = uid(8);
  const workDir = resolve(
    tempDir || resolve(process.cwd(), 'node_modules/.temp/'),
    workDirName,
  );
  await ensureDir(workDir);
  log('create temp dir successfully', workDir);
  return workDir;
}

/**
 * 分离物料组件名称和版本号
 *
 * @private
 * @param {string} pkgNameWithVersion
 * @returns {{ [key: string]: any }}
 * @memberof OnlineAccesser
 */
export function getPkgNameAndVersion(pkgNameWithVersion: string): {
  [key: string]: any;
} {
  const matches = pkgNameWithVersion.match(/(@[^/]+)$/);
  if (!matches) {
    return {
      name: pkgNameWithVersion,
    };
  }
  const name = pkgNameWithVersion.replace(matches[0], '');
  return {
    version: matches[0].slice(1),
    name,
  };
}

// 将问题转化为本地物料化场景
export default async function localize(options: MaterialParseOptions): Promise<{
  workDir: string;
  moduleDir: string;
  entry?: string;
}> {
  // 创建临时目录
  const workDir = await createWorkDir(options.tempDir);
  await ensureDir(workDir);
  const { name, version = 'latest', npmClient } = options;
  // 创建组件包
  await createFakePackage({
    pkgName: name,
    pkgVersion: version,
    workDir,
    npmClient,
    isLocal: options.isLocal,
    file: options.file,
  });

  return {
    workDir,
    moduleDir: join(workDir, 'node_modules', name),
  };
}
