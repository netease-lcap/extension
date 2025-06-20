import fs from 'fs';
import path from 'path';

function readJson(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(`读取 ${filePath} 失败: ${error}`);
    return {};
  }
}

function resolveDependencies(pkg: Record<string, any>) {
  const dependencies = [];

  if (pkg.dependencies) {
    dependencies.push(...Object.keys(pkg.dependencies));
  }

  if (pkg.devDependencies) {
    dependencies.push(...Object.keys(pkg.devDependencies));
  }

  return dependencies;
}

export function addPackageDependencies(root: string) {
  const pkgPath = path.join(root, 'package.json');
  const pkg = readJson(pkgPath);

  const uiLib = pkg.lcap?.['lcap-ui'];
  if (!uiLib) {
    return;
  }

  const dependencies = resolveDependencies(pkg);
  const addDependencies: { name: string; version: string }[] = [];

  if (uiLib.pkgName === '@lcap/element-plus' && !dependencies.includes('element-plus')) {
    addDependencies.push({
      name: 'element-plus',
      version: '^2.9.11',
    });
  }

  if (uiLib.pkgName === '@lcap/element-ui' && !dependencies.includes('@vue/composition-api')) {
    addDependencies.push({
      name: '@vue/composition-api',
      version: '^1.7.2',
    });
  }

  if (addDependencies.length === 0) {
    return;
  }

  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }

  addDependencies.forEach(({ name, version }) => {
    pkg.devDependencies[name] = version;
  });

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}