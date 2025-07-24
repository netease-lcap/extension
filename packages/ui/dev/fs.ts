import { type FileSystem, FileType } from '@lcap/extension-shared/esm/types/fs';
import files from './data.json';

let executeHandler: (message: string) => void;

export function setExecuteHandler(handler: (message: string) => void) {
  executeHandler = handler;
}

export const fs: FileSystem = {
  glob: async (source: string | string[]) => {
    const paths = Object.keys(files);
    if (source.includes('api.ts')) {
      return paths.filter((path) => path.endsWith('api.ts'));
    }

    return paths.filter((path) => path.includes('src/logics') && path.endsWith('.ts'));
  },
  stat: async (path) => {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    if (!files[path]) {
      return undefined;
    }

    return {
      type: files[path].type === 'file' ? FileType.File : FileType.Directory,
      ctime: 0,
      mtime: 0,
      size: files[path].content.length,
    };
  },
  readDirectory: async (path) => {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    if (!files[path]) {
      return [];
    }

    return Object.entries(files).filter(([key]) => key.startsWith(path) && !key.substring(path.length).includes('/')).map(([key, value]) => [key.substring(path.length), value.type === 'file' ? FileType.File : FileType.Directory]);
  },
  readFile: async (path) => {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    if (!files[path]) {
      return undefined;
    }

    return files[path].content;
  },

  writeFile: async (path, content) => {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    if (path.endsWith('api.ts') && executeHandler) {
      executeHandler('nasl.extension building');
    }

    files[path] = {
      type: 'file',
      content,
    };
  },
  rm: async (path) => {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    Object.keys(files).forEach((key) => {
      if (key.startsWith(path)) {
        delete files[key];
      }
    });
  }
};
