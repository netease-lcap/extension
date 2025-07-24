export type Framework = 'vue2' | 'react' | 'vue3' | 'taro' | 'unknown';

export type DeviceType = 'pc' | 'h5';

export interface ProjectLibUIInfo {
  platform: string;
  type: DeviceType;
  version: string;
  pkgName: string;
  framework: string;
}

export interface ExtensionProjectInfo {
  framework: Framework;
  name: string;
  version: string;
  title: string;
  description: string;
  libUIInfo?: ProjectLibUIInfo | null;
  schemaFilePath?: string;
}
