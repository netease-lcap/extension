import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import spawn from 'cross-spawn';
import { snakeCase } from 'lodash-es';
import prompts from 'prompts';
import colors from 'picocolors';
import minimist from 'minimist';
import { genFromNpmPkg } from './pkg';
import { resolveMetaInfo, type FrameworkType } from './meta';
import { copy } from './copy';
import { initSetter } from './setter';

const cliArgs = minimist(process.argv.slice(2));

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

const cwd = process.cwd();

// prettier-ignore

type ColorFunc = (str: string | number) => string;

type Template = {
  name: string;
  display: string;
  color: ColorFunc;
  customCommand?: string;
}

const TEMPLATES: Template[] = [
  {
    name: 'vue2',
    display: 'Vue2 依赖库',
    color: green,
  },
  {
    name: 'vue3',
    display: 'Vue3 依赖库',
    color: green,
  },
  {
    name: 'react',
    display: 'React 依赖库',
    color: green,
  },
];

const defaultTargetDir = 'vue_lcap_extension';

async function init() {
  let targetDir = defaultTargetDir;
  const getProjectName = () => path.basename(path.resolve(targetDir));

  let result: prompts.Answers<
    'projectName' | 'overwrite' | 'packageName' | 'title' | 'template'
  >;

  if (cliArgs.name) {
    targetDir = snakeCase(formatTargetDir(cliArgs.name));
  }

  let pkgMetaInfo: { name: string, version: string, framework: (FrameworkType | 'unknow') } | undefined;
  try {
    if (cliArgs.npm) {
      pkgMetaInfo = await resolveMetaInfo(cliArgs.npm);
    }
  } catch(e) {
    console.log(red(`解析 npm 包错误，找不到包 ${cliArgs.npm} 或包版本错误`));
    console.log(e);
    return;
  }

  if (pkgMetaInfo?.framework === 'unknow') {
    console.log(red(`找不到 ${cliArgs.npm} 的框架信息，无法匹配项目模板`));
    return;
  }

  if (cliArgs.prompt) {
    try {
      result = JSON.parse(cliArgs.prompt);
    } catch(e) {
      console.log(red(`解析 prompt 参数错误`));
      console.log(e);
      return;
    }
  } else {
    try {
      result = await prompts(
        [
          {
            type: () => cliArgs.name ? null : 'text',
            name: 'projectName',
            message: reset('请输入依赖库包名：'),
            initial: snakeCase(formatTargetDir(cliArgs.name)) || (pkgMetaInfo?.name ? `cwx_${snakeCase(pkgMetaInfo.name)}` : defaultTargetDir),
            validate: (value) => {
              return !!value;
            },
            onState: (state) => {
              targetDir = snakeCase(formatTargetDir(state.value)) || defaultTargetDir;
            },
          },
          {
            type: () =>
              !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'select',
            name: 'overwrite',
            message: () =>
              (targetDir === '.'
                ? '当前目录'
                : `目标目录 "${targetDir}"`) +
              ` 已经存在. 请选择接下来的操作：`,
            initial: 0,
            choices: [
              {
                title: '取消创建',
                value: 'no',
              },
              {
                title: '删除当前目录，并继续',
                value: 'yes',
              },
              {
                title: '忽略文件，并继续',
                value: 'ignore',
              },
            ],
          },
          {
            type: (_, { overwrite }: { overwrite?: string }) => {
              if (overwrite === 'no') {
                throw new Error(red('✖') + ' 已取消');
              }
              return null;
            },
            name: 'overwriteChecker',
          },
          {
            type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
            name: 'packageName',
            message: reset('包名：'),
            initial: () => toValidPackageName(getProjectName()),
            validate: (dir) =>
              isValidPackageName(dir) || 'Invalid package.json name',
          },
          {
            type: 'text',
            name: 'title',
            message: reset('请输入依赖库中文名：'),
          },
          {
            type: () => pkgMetaInfo && pkgMetaInfo.framework !== 'unknow' ? null : 'select',
            name: 'template',
            message: reset('请选择模板:'),
            initial: 0,
            choices: TEMPLATES.map((t) => {
              const frameworkColor = t.color;
              return {
                title: frameworkColor(t.display || t.name),
                value: t.name,
              };
            }),
          },
        ],
        {
          onCancel: () => {
            throw new Error(red('✖') + ' 已取消');
          },
        },
      );
    } catch (cancelled: any) {
      console.log(cancelled.message);
      return;
    }
  }

  // user choice associated with prompts
  let { overwrite, packageName, title } = result;

  let template = result.template;

  if (pkgMetaInfo && (pkgMetaInfo.framework as any) !== 'unknow') {
    template = pkgMetaInfo.framework;
  }

  const root = path.join(cwd, targetDir);

  if (overwrite === 'yes') {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm';
  const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.');

  const { customCommand } = TEMPLATES.find((v) => v.name === template) ?? {};

  if (customCommand) {
    const fullCustomCommand = customCommand
      .replace(/^npm create /, () => {
        // `bun create` uses it's own set of templates,
        // the closest alternative is using `bun x` directly on the package
        if (pkgManager === 'bun') {
          return 'bun x create-';
        }
        return `${pkgManager} create `;
      })
      // Only Yarn 1.x doesn't support `@version` in the `create` command
      .replace('@latest', () => (isYarn1 ? '' : '@latest'))
      .replace(/^npm exec/, () => {
        // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
        if (pkgManager === 'pnpm') {
          return 'pnpm dlx';
        }
        if (pkgManager === 'yarn' && !isYarn1) {
          return 'yarn dlx';
        }
        if (pkgManager === 'bun') {
          return 'bun x';
        }
        // Use `npm exec` in all other cases,
        // including Yarn 1.x and other custom npm clients.
        return 'npm exec';
      });

    const [command, ...args] = fullCustomCommand.split(' ');
    // we replace TARGET_DIR here because targetDir may include a space
    const replacedArgs = args.map((arg) =>
      arg.replace('TARGET_DIR', () => targetDir),
    );
    const { status } = spawn.sync(command, replacedArgs, {
      stdio: 'inherit',
    });
    process.exit(status ?? 0);
  }

  console.log(`\n${root} 目录下，创建项目中...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    `templates/${template}`,
  );

  const replaceTemplateList = [{
    reg: /\{\{LIBRARY_NAME\}\}/g,
    text: packageName || getProjectName(),
  }]

  const write = (file: string, content?: string) => {
    let targetPath = path.join(root, file);
    if (file.startsWith('_')) {
      targetPath = path.join(root, '.' + file.substring(1));
    }

    if (content) {
      replaceTemplateList.forEach(({ reg, text }) => {
        content = content?.replace(reg, text);
      });

      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
  );

  pkg.name = packageName || getProjectName();
  pkg.title = title;
  pkg.description = title;
  pkg.version = '1.0.0';

  write('package.json', JSON.stringify(pkg, null, 2) + '\n');

  if (template === 'vue2') {
    const entry = path.join(root, 'src', 'index.ts');
    if (fs.existsSync(entry)) {
      let entryContent = fs.readFileSync(entry, 'utf-8').toString();
      replaceTemplateList.forEach(({ reg, text }) => {
        entryContent = entryContent?.replace(reg, text);
      });

      fs.writeFileSync(entry, entryContent, 'utf-8');
    }
  }

  if (template !== 'vue3') {
    const answers = await prompts([
      {
        type: 'confirm',
        name: 'useLcap',
        message: '是否添加 CodeWave 基础组件包?',
        initial: false,
      }
    ]);

    if (answers.useLcap) {
      spawn.sync('lcap', ['install'], {
        cwd: root,
        stdio: 'inherit',
      });
    }
  }

  if (pkgMetaInfo) {
    console.log('\n' + green('创建成功! ') + `目录 ${targetDir}，准备安装包，解析 ${pkgMetaInfo.name}${pkgMetaInfo.version ? `@${pkgMetaInfo.version}` : ''}\n`);
    await genFromNpmPkg(root, pkgMetaInfo);
    return;
  }

  const cdProjectName = path.relative(cwd, root);
  console.log('\n' + green('创建成功! ') + '👉 请使用以下命令:\n');
  if (root !== cwd) {
    console.log(
      cyan(`  cd ${
        cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName
      }`),
    );
  }
  switch (pkgManager) {
    case 'yarn':
      console.log(cyan('  yarn'));
      console.log(cyan('  yarn create'));
      console.log(cyan('  yarn dev'));
      break;
    default:
      console.log(cyan(`  ${pkgManager} install`));
      console.log(cyan(`  ${pkgManager} run create`));
      console.log(cyan(`  ${pkgManager} run dev`));
      break;
  }
  console.log();
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '');
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  );
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-');
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

if (cliArgs.setter) {
  initSetter(process.cwd()).catch((e) => {
    console.error(e);
  });
} else {
  init().catch((e) => {
    console.error(e);
  });
}
