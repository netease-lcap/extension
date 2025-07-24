import { getComponentList, getComponentDetail, getAPIContent, removeComponent, updateComponent, getProjectMetaInfo, getProjectSourceSchema, setExecuteHandler } from './service';

const apiMap = {
  '/api/component/list': () => {
    return getComponentList();
  },
  '/api/component/info': ({ params }: { params: Record<string, any> }) => {
    return getComponentDetail(params.name);
  },
  '/api/component/api/file': ({ params }: { params: Record<string, any> }) => {
    return getAPIContent(params.name);
  },
  '/api/component/remove': ({ body }: { body: Record<string, any> }) => {
    return removeComponent(body.name);
  },
  '/api/component/update': ({ body }: { body: Record<string, any> }) => {
    return updateComponent(body.tsPath, body.actions);
  },
  '/api/project/meta': () => {
    return getProjectMetaInfo();
  },
  '/api/project/source': () => {
    return getProjectSourceSchema();
  },
};

async function request(path: string, method: 'GET' | 'POST', data: Record<string, any>) {
  const url = new URL(path, 'http://localhost:3000');
  const urlPath = url.pathname;
  const handle = apiMap[urlPath];

  if (!handle) {
    return {
      status: 200,
      data: {
        code: 500,
        message: `API ${urlPath} not found`,
        data: null,
      },
    }
  }

  const params = {
    ...(method === 'GET' ? data : {}),
  };

  const body = method === 'GET' ? undefined : data;

  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    const result = await handle({
      params,
      body,
    });

    return {
      status: 200,
      data: {
        code: 200,
        message: 'success',
        data: result,
      },
    }
  } catch(e) {
    console.error(e);
    return {
      status: 200,
      data: {
        code: 500,
        message: e.message,
        data: null,
      },
    };
  }
}

export const httpInstance: {
  get: (path: string, p: { params?: Record<string, any> }) => Promise<any>;
  post: (path: string, data: Record<string, any>) => Promise<any>;
  executeHandler?: (message: string) => void;
} = {
  get: async (path: string, { params = {} } = {}) => {
    return request(path, 'GET', params);
  },
  post: async (path: string, data: Record<string, any>) => {
    return request(path, 'POST', data);
  },
}

setExecuteHandler((message) => {
  httpInstance.executeHandler?.(message);
});
