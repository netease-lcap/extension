import spawn from 'cross-spawn';
import { kebabCase } from 'lodash-es';
import prompts from 'prompts';
import colors from 'picocolors';
import { FrameworkType } from './meta';

type PkgManager = 'npm' | 'pnpm' | 'yarn';

function execCommand(command: string, root: string) {
  console.log(colors.cyan(`执行命令: ${command}`));
  const [cmd, ...args] = command.split(' ');
  const { status } = spawn.sync(
    cmd,
    args,
    { cwd: root, stdio: 'inherit' },
  );

  if (status) {
    throw new Error(`执行命令失败: ${command}`);
  }
}

function execInstall(root: string, pkgManager: PkgManager) {
  switch (pkgManager) {
    case 'npm':
      execCommand('npm install', root);
      break;
    case 'pnpm':
      execCommand('pnpm i', root);
      break;
    case 'yarn':
      execCommand('yarn', root);
    default: break;
  }
}

export async function genFromNpmPkg(root: string, libInfo: { name: string, version: string, framework: FrameworkType | 'unknow' }) {
  const { pkgManager } = await prompts([
    {
      type: 'select',
      name: 'pkgManager',
      message: '请选择包管理工具：',
      initial: 0,
      choices: [
        {
          title: 'npm',
          value: 'npm',
        },
        {
          title: 'pnpm',
          value: 'pnpm',
        },
        {
          title: 'yarn',
          value: 'yarn',
        }
      ],
    }
  ]);

  const pkg = `${libInfo.name}${libInfo.version ? `@${libInfo.version}` : ''}`;
  // 安装依赖
  execInstall(root, pkgManager);

  const schemaFile = kebabCase(libInfo.name) + '.json';

  // 执行包解析 & 生成
  execCommand(`npx lcap-scripts parse ${pkg} --npmClient ${pkgManager} --output ${schemaFile} --generate`, root);

  // 执行 play
  execCommand(`npm run play`, root);
}
