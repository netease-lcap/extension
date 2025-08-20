import { format } from 'prettier/standalone';
import typescript from 'prettier/plugins/typescript';
import estree from 'prettier/plugins/estree';
import { Logger, setLogger } from './utils/logger';
import { FileSystem } from './types/fs';
import { setFileSystem } from './utils/file-system';
import { getComponentMetaInfos } from './utils/api-meta';
import { getProjectInfo, getLcapUIComponentList, getSourceSchema } from './project';
import genNaslComponentConfig, { NaslViewComponentOptions } from './nasl-view-component';
import updateAPIFile, { APIUpdateOptions } from './utils/api-update';
import getNaslLogics from './nasl-logics';
import { removeComponentFiles } from './utils/remove-component';
import { addTypeMap } from './utils/add-type';

export interface ExtensionServiceOptions {
  rootPath: string;
  logger: Logger;
  fileSystem: FileSystem;
}

async function formatCode(code: string) {
  const result = await format(code, {
    parser: 'typescript',
    plugins: [typescript, estree],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    vueIndentScriptAndStyle: false,
    trailingComma: 'all',
    bracketSpacing: true,
    bracketSameLine: true,
    arrowParens: 'always',
    semi: true,
  });

  return result;
}

export class ExtensionService {
  private options: ExtensionServiceOptions;

  constructor(options: ExtensionServiceOptions) {
    this.options = options;
    setLogger(options.logger);
    setFileSystem(options.fileSystem);
  }

  async getProjectInfo(rootPath?: string) {
    return getProjectInfo(rootPath || this.options.rootPath);
  }

  async getLcapUIComponentList(rootPath?: string) {
    return getLcapUIComponentList(rootPath || this.options.rootPath);
  }

  async getSourceSchema(rootPath?: string) {
    return getSourceSchema(rootPath || this.options.rootPath);
  }

  async getNaslLogics(rootPath?: string) {
    return getNaslLogics(rootPath || this.options.rootPath);
  }

  async getNaslViewComponent(options: Partial<NaslViewComponentOptions> & { apiPath: string, assetsPublicPath: string }, useInAPIEditor: boolean = false) {
    if (!options.apiPath) {
      throw new Error('apiPath is required');
    }

    if (!options.rootPath) {
      options.rootPath = this.options.rootPath;
    }

    const projectInfo = await this.getProjectInfo(options.rootPath);
    if (!options.libInfo) {
      options.libInfo = [projectInfo.name, projectInfo.version].join('@');
    }

    if (!options.framework) {
      options.framework = projectInfo.framework;
    }

    const component = await genNaslComponentConfig(options as NaslViewComponentOptions);

    if (useInAPIEditor) {
      return addTypeMap(component);
    }

    return component;
  }

  async getNaslComponentMetaList(rootPath?: string, parseAPI: boolean = false) {
    return getComponentMetaInfos(rootPath || this.options.rootPath, parseAPI);
  }

  async updateNaslViewComponent(tsPath: string, actions: APIUpdateOptions[], rootPath?: string) {
    return updateAPIFile(rootPath || this.options.rootPath, tsPath, actions, formatCode);
  }

  async removeNaslComponent(name: string, rootPath?: string) {
    return removeComponentFiles(rootPath || this.options.rootPath, name);
  }
}
