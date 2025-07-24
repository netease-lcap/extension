export interface FileSystem {
  glob(source: string | string[], options?: GlobOptions): Promise<string[]>;
  stat(uri: string): Promise<FileStat | undefined>;
  readDirectory(uri: string): Promise<[string, FileType][]>;
  readFile(uri: string, encoding?: string): Promise<any>;
  writeFile(
    uri: string,
    content: any,
    options?: { encoding?: string; mode?: number },
  ): Promise<void>;
  rm(uri: string): Promise<void>;
}

export interface FileStat {
  type: FileType;
  ctime: number;
  mtime: number;
  size: number;
}

export declare enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64,
}

export interface GlobOptions {
  cwd?: string;
  absolute?: boolean;
  dot?: boolean;
  ignore?: string[];
}
