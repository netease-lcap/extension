import { MaterialComponent, MaterialScanMeta } from '../types/parse';
import { installPeerAndDeps } from '../utils/install';
import parseConfig from './config';
import parseJS from './js';
import parseDynamic from './dynamic';
import consola from 'consola';

export default async function (
  args: MaterialScanMeta,
): Promise<MaterialComponent[]> {
  const {
    mainFileAbsolutePath,
    moduleFileAbsolutePath,
    webTypeFileAbsolutePath,
    veturAttributesFileAbsolutePath,
    veturTagFileAbsolutePath,
  } = args;
  const hasConfig =
    webTypeFileAbsolutePath ||
    (veturAttributesFileAbsolutePath && veturTagFileAbsolutePath);

  consola.start('开始安装依赖包....');
  await installPeerAndDeps(args);
  consola.success('安装成功');

  if (hasConfig) {
    return await parseConfig(args);
  }

  try {
    return await parseJS(moduleFileAbsolutePath || mainFileAbsolutePath);
  } catch (e) {
    return await parseDynamic(mainFileAbsolutePath);
  }
}
