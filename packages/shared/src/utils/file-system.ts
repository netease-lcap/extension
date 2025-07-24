import { FileSystem, GlobOptions } from '../types/fs';

let fileSystem: FileSystem = {
  glob: async (source, options) => {
    return [];
  },
  stat: async (uri) => {
    return undefined;
  },
  readDirectory: async (uri) => {
    return [];
  },
  readFile: async (uri) => {
    return undefined;
  },
  writeFile: async (uri, content, options) => {},
  rm: async (uri) => {},
};

export async function stat(uri: string) {
  return fileSystem.stat(uri);
}

export async function exists(uri: string) {
  const stat = await fileSystem.stat(uri);
  return stat !== undefined;
}

export function setFileSystem(fs: FileSystem) {
  fileSystem = fs;
}

export async function readJSON(uri: string) {
  const content = await fileSystem.readFile(uri, 'utf-8');
  return JSON.parse(content);
}

export async function readFile(uri: string, encoding: string) {
  return fileSystem.readFile(uri, encoding);
}

export async function writeFile(uri: string, content: string, options: any) {
  return fileSystem.writeFile(uri, content, options);
}

export async function readDirectory(uri: string) {
  return fileSystem.readDirectory(uri);
}

export async function glob(uri: string, options: GlobOptions) {
  return fileSystem.glob(uri, options);
}

export async function rm(uri: string) {
  return fileSystem.rm(uri);
}

export default fileSystem;
