#!/usr/bin/env node
import path, { dirname } from 'node:path';
import fs from 'fs-extra';
import picocolors from 'picocolors';
import { parse } from '@lcap/material-parser';
import semver from 'semver';
import { program } from 'commander';
import { fileURLToPath } from 'node:url';


function checkNodeVersion(requireNodeVersion, frameworkName = '@lcap/parse-cli') {
  if (!semver.satisfies(process.version, requireNodeVersion)) {
    console.log();
    console.log(chalk.red(`  You are using Node ${process.version}`));
    console.log(chalk.red(`  ${frameworkName} requires Node ${requireNodeVersion}, please update Node.`));
    console.log();
    console.log();
    process.exit(1);
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

async function setPkgLcapScheme(output) {
  const pkgPath = path.resolve(process.cwd(), './package.json');
  if (!fs.existsSync(pkgPath)) {
    return;
  }
  const pkg = await fs.readJSON(pkgPath);

  if (!pkg.lcap) {
    pkg.lcap = {};
  }

  pkg.lcap.schema = output;

  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
}

export async function parseNPM(options) {
  if (!options.name) {
    throw new Error('please input pkg name');
  }

  const {
    name,
    version,
    output = 'schema.json',
    tempDir,
    npmClient = 'npm',
  } = options;

  const result = await parse({
    name,
    version,
    tempDir,
    npmClient,
  });

  await fs.ensureFile(output);
  await fs.writeJSON(output, result, { spaces: 2 });

  await setPkgLcapScheme(output);
}

(async function() {
  const packageInfo = await fs.readJSON(path.join(__dirname, './package.json'));
  checkNodeVersion(packageInfo.engines.node, packageInfo.name);

  program
    .name('lcap-parse')
    .version(packageInfo.version)
    .helpOption(false)
    .description('解析 npm 包')
    .argument('<pkg>', 'npm 包名，例如: antd、 element-ui@beta')
    .option('-o, --output <file>', '输出的文件名， 默认 schema.json')
    .option('-t, --tempDir <dir>', '临时目录')
    .option('-n, --npmClient <client>', 'npm 客户端，npm、yarn、pnpm, 默认npm')
    .action(async (pkg, options) => {
      const i = pkg.indexOf('@');
      let name, version;
      if (i > 0) {
        name = pkg.substring(0, i);
        version = pkg.substring(i + 1);
      } else {
        name = pkg;
      }

      try {
        console.log(picocolors.bgBlue(`开始解析包 ${pkg}`), options);
        await parseNPM({
          ...options,
          name,
          version,
        });

        console.log(picocolors.green(`解析包 ${pkg} 成功，生成文件 ${options.output || 'schema.json'}`));
      } catch(e) {
        console.log(picocolors.red(`解析包 ${pkg} 失败, ${e.message}`));
        console.log(e);
        process.exit(1);
      }
    })

  program.parse(process.argv);

  const proc = program.runningCommand;

  if (proc) {
    proc.on('close', process.exit.bind(process));
    proc.on('error', () => {
      process.exit(1);
    });
  }
})()
