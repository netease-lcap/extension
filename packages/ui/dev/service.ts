import { ExtensionService } from '@lcap/extension-shared/esm/service';
import { fs, setExecuteHandler } from './fs';

const ROOT_PATH = '';
const service = new ExtensionService({
  fileSystem: fs,
  logger: console,
  rootPath: ROOT_PATH,
});

export { setExecuteHandler };

export function getComponentList() {
  return service.getNaslComponentMetaList(ROOT_PATH, true);
}

export function getProjectMetaInfo() {
  return service.getProjectInfo();
}

export function getProjectSourceSchema() {
  return service.getSourceSchema();
}

export async function getComponentDetail(name: string) {
  const list = await service.getNaslComponentMetaList(ROOT_PATH, true);
  const component = list.find((item) => item.name === name);

  if (!component) {
    return '';
  }

  return service.getNaslViewComponent({
    apiPath: component.tsPath,
    assetsPublicPath: '/packages',
  }, true);
}

export async function getAPIContent(name: string) {
  const list = await service.getNaslComponentMetaList(ROOT_PATH, true);
  const component = list.find((item) => item.name === name);

  if (!component) {
    return '';
  }

  return await fs.readFile(component.tsPath, 'utf-8');
}

export async function createComponent() {
  return true;
}

export async function removeComponent(name: string) {
  await service.removeNaslComponent(name);
  return true;
}

export async function updateComponent(tsPath: string, actions: any[]) {
  await service.updateNaslViewComponent(tsPath, actions);
  return true;
}
