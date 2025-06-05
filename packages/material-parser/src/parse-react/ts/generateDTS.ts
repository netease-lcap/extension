import * as path from 'path';
import { writeFileSync } from 'fs-extra';
import { loadFile } from '../../utils/fs';

import { debug } from '../../utils/debug';

const log = debug.extend('parse:ts:generate_dts');

/**
 * Generate alias dts file by removing some needless interfaces.
 * Replace original file at present, which will cause type pollution, looking for better solution
 * @param {string} workDir - the dir containing the module to be parsed
 * @returns {string} - the path of generated xxx.d.ts
 */
export default function generateDTS({
  workDir,
  dslType = 'react',
}: {
  workDir: string;
  dslType?: string;
}): {
  originalTypePath: string;
  newTypePath: string;
} {
  const typeDir = path.join(workDir, 'node_modules', `@types/react`);
  const typePath = path.join(typeDir, 'index.d.ts');
  const fileContent = loadFile(typePath);

  const materialParserTypeDir = typeDir;
  const newTypePath = path.join(materialParserTypeDir, 'index.d.ts');

  let newContent = fileContent.replace(
    /(?<=interface HTMLAttributes[^e]+)(extends[^}]+)/,
    `{
    style?: CSSProperties;
    className?: string;
  `,
  );
  newContent = newContent.replace(
    /(?<=interface IntrinsicElements {)([^}]+)/,
    '',
  );
  newContent = newContent.replace(/type LibraryManagedAttributes[^;]+;/, '');
  writeFileSync(newTypePath, newContent);
  log('generate dts', newTypePath);

  return {
    originalTypePath: typePath,
    newTypePath,
  };
}
