import { camelCase, kebabCase, upperFirst } from 'lodash';
import { MaterialComponent, MaterialScanMeta } from '../../types/parse';
import { parseWebTypes } from './parse-web-types';
import { parseVetur } from './parse-vetur';
import parseExports from './parse-exports';

function removeRepeatItem(arr: Array<{ name: string; [key: string]: any }>) {
  const list: any[] = [];

  arr.forEach((it) => {
    if (list.findIndex((t) => it.name === t.name) === -1) {
      list.push(it);
    }
  });

  return list;
}

/**
 * 配置解析
 * @param args 扫描信息
 * @returns MaterialComponent[]
 */
export default async function (
  args: MaterialScanMeta,
): Promise<MaterialComponent[]> {
  const exportNames = await parseExports(args);
  let components: MaterialComponent[] = [];
  if (args.webTypeFileAbsolutePath) {
    components = parseWebTypes(args.webTypeFileAbsolutePath);
  } else if (
    args.veturTagFileAbsolutePath &&
    args.veturAttributesFileAbsolutePath
  ) {
    components = parseVetur(
      args.veturTagFileAbsolutePath,
      args.veturAttributesFileAbsolutePath,
    );
  }
  // parseConfig
  return components.map((comp) => {
    const aliasName = upperFirst(
      camelCase(kebabCase(comp.name).split('-').slice(1).join('-')),
    );

    if (exportNames.includes(comp.name)) {
      comp.exportName = comp.name;
    } else if (exportNames.includes(aliasName)) {
      comp.exportName = aliasName;
    }

    return {
      ...comp,
      attrs: removeRepeatItem(comp.attrs),
      slots: removeRepeatItem(comp.slots),
      events: removeRepeatItem(comp.events),
      methods: removeRepeatItem(comp.methods),
    };
  }).filter((c) => !!c.exportName);
}
