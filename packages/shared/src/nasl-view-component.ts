import path from 'node:path';
import { exists, readDirectory, stat, readFile } from './utils/file-system';
import logger from './utils/logger';
import parseComponentAPI from './transforms/parse-component-api';
import transformStory2Blocks from './transforms/story-nasl-block';
import { FileType } from './types/fs';
import { Framework } from './types/project';

async function hasImg(dir: string) {
  const fileStat = await stat(path.join(dir, '0.png'));
  return fileStat?.type === FileType.File;
}
async function hasSvg(dir: string) {
  const fileStat = await stat(path.join(dir, '0.svg'));
  return fileStat?.type === FileType.File;
}

async function getScreenShot(componentDir: string, assetsPublicPath: string) {
  let screenShot: string[] = [];
  try {
    const screenShotPath = `${componentDir}/screenshots`;
    if (await hasImg(screenShotPath)) {
      const files = await readDirectory(screenShotPath);

      screenShot = files
        .map(([filename]) => filename)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .filter((filename) => filename.indexOf('.DS_Store') === -1);

      screenShot = screenShot.map((screen) => {
        return `${assetsPublicPath}/screenshots/${screen}`;
      });
    }
  } catch (e) {
    logger.warn(`找不到 screenShot 文件 ${componentDir}/screenshots`);
  }
  return screenShot;
}

async function getDrawings(componentDir: string, assetsPublicPath: string) {
  let drawings: string[] = [];
  try {
    const drawingsPath = `${componentDir}/drawings`;
    if (await hasSvg(drawingsPath)) {
      const files = await readDirectory(drawingsPath);
      drawings = files
        .map(([filename]) => filename)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .filter((filename) => filename.indexOf('.DS_Store') === -1);
      drawings = drawings.map((drawing) => {
        return `${assetsPublicPath}/drawings/${drawing}`;
      });
    }
  } catch (e) {
    logger.warn(`找不到 drawings 文件 ${componentDir}/drawings`);
  }
  return drawings;
}

async function getBlocksByDemo(
  componentDir: string,
  { screenshots, drawings }: { screenshots: string[]; drawings: string[] },
) {
  const dir = path.join(componentDir, 'demos/blocks');
  if (!(await exists(dir))) {
    logger.warn('未找到 blocks: ', dir);
    return [];
  }

  const files = (await readDirectory(dir))
    .filter(([p]) => p.endsWith('.vue'))
    .map(([p]) => p)
    .sort((a, b) => {
      const n1 = Number(a.substring('BlocksDemo'.length, a.lastIndexOf('.')));
      const n2 = Number(b.substring('BlocksDemo'.length, b.lastIndexOf('.')));
      return n1 - n2;
    });

  const blocks: any[] = [];

  for (const [file, index] of files) {
    let content = await readFile(path.join(dir, file), 'utf-8');
    const matches = content.match(/<!--.*?-->/);
    let title = '';
    if (matches && matches.length > 0) {
      title = matches[0].replace(/<!--/, '').replace(/-->/, '').trim();
      content = content.replace(/<!--.*?-->/, '');
    }

    const code = content
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => !!s)
      .join('\n');
    blocks.push({
      concept: 'ViewBlockWithImage',
      title,
      description: '',
      code,
      screenshot: screenshots[index] || '',
      drawing: drawings[index] || '',
    });
  }

  return blocks;
}

async function genBlockConfig(
  componentDir: string,
  { screenshots, drawings }: { screenshots: string[]; drawings: string[] },
  framework: string,
) {
  let storyFilePath = `${componentDir}/stories/block.stories`;
  if (await exists(`${storyFilePath}.jsx`)) {
    storyFilePath = `${storyFilePath}.jsx`;
  } else if (await exists(`${storyFilePath}.tsx`)) {
    storyFilePath = `${storyFilePath}.tsx`;
  } else if (await exists(`${storyFilePath}.js`)) {
    storyFilePath = `${storyFilePath}.js`;
  } else {
    return getBlocksByDemo(componentDir, { screenshots, drawings });
  }

  const code = await readFile(storyFilePath, 'utf-8');

  const blocks = transformStory2Blocks(code.toString(), framework);
  return blocks.map(({ name, template }, index) => ({
    concept: 'ViewBlockWithImage',
    title: name,
    description: '',
    code: template,
    screenshot: screenshots[index] || '',
    drawing: drawings[index] || '',
  }));
}

export interface NaslViewComponentOptions {
  apiPath: string;
  rootPath: string;
  assetsPublicPath: string;
  libInfo: string;
  extraConfig?: Record<string, any>;
  framework?: Framework;
}

export default async function genNaslComponentConfig({
  apiPath,
  rootPath,
  assetsPublicPath,
  libInfo,
  extraConfig = {},
  framework = 'react',
}: NaslViewComponentOptions) {
  const component: any = {
    ...extraConfig,
  };

  try {
    const apiCode = await readFile(apiPath, 'utf-8');
    const nasl = parseComponentAPI(apiCode, framework);
    Object.assign(component, nasl[0]);
  } catch (e: any) {
    logger.error(`解析 ${apiPath} 失败`);
    throw e;
  }

  if (component.apiPath && !component.show) {
    delete component.symbol;
    delete component.apiPath;
    return {
      ...component,
      blocks: [],
    };
  }

  const componentDir = path.resolve(apiPath, '../');
  const assetsPath = [
    assetsPublicPath,
    libInfo,
    componentDir.substring(rootPath.length + 1),
  ].join('/');

  const screenshots = await getScreenShot(componentDir, assetsPath);
  const drawings = await getDrawings(componentDir, assetsPath);

  try {
    const blocks = await genBlockConfig(
      componentDir,
      { screenshots, drawings },
      framework,
    );
    Object.assign(component, { blocks });
  } catch (e: any) {
    logger.error(`${component.name} 处理 block 异常`);
    logger.error(e);
    throw e;
  }

  return component;
}
