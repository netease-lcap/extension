import http from './http';
import type { NaslComponent, APIUpdateOptions } from '../types/component';

export interface ComponentMetaInfo {
  name: string;
  title?: string;
  show?: boolean;
  group?: string;
  icon?: string;
  sourceName?: string;
  tsPath: string;
  children?: ComponentMetaInfo[];
}

export async function getComponentList() {
  const response = await http.get<ComponentMetaInfo[]>('/api/component/list');
  if (!response || !response.data) {
    return [];
  }

  return response.data;
}

export async function getComponentDetail(name: string) {
  const response = await http.get<NaslComponent>(`/api/component/info?name=${name}`);
  if (!response || !response.data) {
    return null;
  }

  return response.data;
}


export async function getAPIContent(name: string) {
  const response = await http.get<string>(`/api/component/api/file?name=${name}`);
  if (!response || !response.data) {
    return '';
  }

  return response.data;
}

export async function createComponent(name: string) {
  const response = await http.post<boolean>(`/api/component/create`, { name });
  if (!response || !response.data) {
    return false;
  }

  return response.data;
}

export async function removeComponent(name: string) {
  const response = await http.post<boolean>(`/api/component/remove`, { name });
  if (!response || !response.data) {
    return false;
  }

  return response.data;
}

export interface UpdateComponentParams {
  tsPath: string;
  actions: APIUpdateOptions[];
}

export async function updateComponent(params: UpdateComponentParams) {
  const response = await http.post<boolean>('/api/component/update', params);

  if (!response || !response.data) {
    return false;
  }

  return true;
}
