let messageApi: any;
let modalApi: any;
export function initMessage(message: any, modal: any) {
  messageApi = message;
  modalApi = modal;
}

export function getMessageApi() {
  return messageApi;
}

export function getModalApi() {
  return modalApi;
}
