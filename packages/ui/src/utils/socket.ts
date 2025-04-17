import { getModalApi } from './message';

export type MessageHandler = (message: string) => void;

const handlers: MessageHandler[] = [];

const handleMessage = (message: MessageEvent) => {
  handlers.forEach((handler) => {
    handler(message.data);
  });
};

let socket: WebSocket;
export const startWatcherSocket = () => {
  const protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
  const address = protocol + window.location.host + window.location.pathname + '/ws';
  socket = new WebSocket(address);
  socket.onmessage = handleMessage;
  socket.onclose = () => {
    getModalApi().warning({
      title: '连接已断开',
      content: '请重新执行项目中 play 命令后刷新页面',
      onOk: () => {
        window.location.reload();
      },
    });
  }
};

export const stopWatcherSocket = () => {
  if (!socket) {
    return;
  }

  socket.close();
};


export const addMessageHandler = (handler: MessageHandler) => {
  handlers.push(handler);
};

export const removeMessageHandler = (handler: MessageHandler) => {
  handlers.splice(handlers.indexOf(handler), 1);
};
