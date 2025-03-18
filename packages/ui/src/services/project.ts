import http from './http';

export interface ProjectLibUIInfo {
  platform: string;
  type: 'pc' | 'h5';
  version: string;
  pkgName: string;
  framework: string;
}

export interface ProjectMetaInfo {
  framework: 'vue2' | 'react' | 'vue3' | 'taro';
  name: string;
  title: string;
  version: string;
  libUIInfo: ProjectLibUIInfo | null;
}

export interface MaterialSchema {
  name: string;
  version: string;
  description: string;
  framework: 'vue2' | 'react' | 'vue3' | 'unknow';
  frameworkVersion?: string;
  components: any[];
}

export interface LcapConfig {
  platform: string;
  username: string;
  password: string;
}

export async function getProjectMetaInfo() {
  const response = await http.get<ProjectMetaInfo>('/api/project/meta');

  if (!response || !response.data) {
    return null;
  }

  return response.data;
}

export async function getProjectSchema() {
  const response = await http.get<MaterialSchema>('/api/project/source');

  if (!response || !response.data) {
    return null;
  }

  return response.data;
}

export async function getLcapConfig() {
  const response = await http.get<LcapConfig>('/api/project/lcap');

  if (!response || !response.data) {
    return {} as LcapConfig;
  }

  return response.data;
}

export interface ReleaseProjectParams {
  name?: string;
  version?: string;
  title?: string;
  description?: string;
  platform?: string;
  username?: string;
  password?: string;
}

export async function releaseProject(params: ReleaseProjectParams) {
  const response = await http.post<boolean>('/api/project/release', params);

  if (!response || !response.data) {
    return false;
  }

  return response.data;
}

export async function getProjectPreviewUrl() {
  const response = await http.get<string>('/api/project/previewURL');

  if (!response || !response.data) {
    return '';
  }

  return response.data;
}
