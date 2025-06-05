import consola from 'consola';
import parseDynamic from './dynamic';
import parseJS from './js';
import parseTS from './ts';
import { debug } from '../utils/debug';
import { MaterialScanMeta } from '../types/parse';
import { syncTypeModules, installPeerAndDeps } from '../utils/install';

export { resolveReactSchema } from './adaptor';

const log = debug.extend('parse');

export function isTSLike(str: string) {
  return str.endsWith('ts') || str.endsWith('tsx');
}

export default async (args: MaterialScanMeta) => {
  const {
    typingsFileAbsolutePath,
    mainFileAbsolutePath,
    moduleFileAbsolutePath,
  } = args;

  const entryPath = typingsFileAbsolutePath || mainFileAbsolutePath;
  // ts
  if (entryPath && isTSLike(entryPath)) {
    consola.start('typescript parser starting, 开始安装依赖包....');
    await syncTypeModules(args);
    // await install(args);
    await installPeerAndDeps(args);
    consola.success('安装成功');
    return parseTS(entryPath, args);
  }

  // js
  try {
    consola.start('dynamic parser starting, 开始安装依赖包....');
    // try dynamic parsing first
    await installPeerAndDeps(args);
    consola.success('安装成功');
    const info = parseDynamic(mainFileAbsolutePath);
    if (!info || !info.length) {
      throw Error();
    }
    return info;
  } catch (e) {
    log(e);
    consola.start('JS parser starting');
    // if error, use static js parsing instead
    return parseJS(moduleFileAbsolutePath || mainFileAbsolutePath);
  }
};
