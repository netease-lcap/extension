import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getMessageApi } from '../utils/message';

export interface HttpResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export const http = Axios.create({
  baseURL: '',
  validateStatus(status) {
    return status === 200;
  },
});

function handleResponse<T>(response: AxiosResponse<HttpResponse<T>>) {
  if (response.status !== 200 || (response.data && response.data.code !== 200)) {
    getMessageApi()?.error(response.data && response.data.message ? response.data.message : '请求失败');
    return null;
  }

  return response.data;
}

export default {
  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await http.get<HttpResponse<T>>(url, config);

    return handleResponse(response);
  },
  async post<T>(url: string, data: Record<string, any>, config?: AxiosRequestConfig) {
    const response = await http.post<HttpResponse<T>>(url, data, config);

    return handleResponse(response);
  },
};
