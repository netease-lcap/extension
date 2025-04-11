import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import colors from 'picocolors';
import { copyDir } from './copy';

const {
  blue,
  blueBright,
  cyan,
  green,
  greenBright,
  magenta,
  red,
  redBright,
  reset,
  yellow,
} = colors;

const templateDir = path.resolve(
  fileURLToPath(import.meta.url),
  '../..',
  `templates/setters`,
);

async function isExtensionProject(rootPath: string) {
  try {
    const content = await fs.readFile(path.resolve(rootPath, 'package.json'), 'utf-8');
    const pkg = JSON.parse(content);
    return !!pkg.lcapIdeVersion;
  } catch(e) {

  }

  return false;
}

export async function initSetter(rootPath: string) {
  const isExtension = await isExtensionProject(rootPath);
  if (!isExtension) {
    throw new Error('当前项目不是依赖库项目');
  }

  copyDir(templateDir, path.resolve(rootPath, 'setters'));

  console.log('\n' + green('创建成功! ') + '👉 请使用以下命令:\n');
  console.log(
    cyan(`  cd setters`),
  );
  console.log(
    cyan(`  npm install`),
  );
  console.log(
    cyan(`  npm run dev`),
  );
}
