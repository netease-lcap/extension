import { useCallback, useEffect } from 'react';
import { addMessageHandler, removeMessageHandler } from '../utils/socket';
import { isNaslChange } from '../utils/check';

export const useSocket = (handler: (message: string) => void) => {
  useEffect(() => {
    addMessageHandler(handler);
    return () => removeMessageHandler(handler);
  }, [handler]);
};

export const useHandleNaslChange = (handler: () => void) => {
  useSocket(useCallback((message) => {
    if (isNaslChange(message)) {
      handler();
    }
  }, [handler]));
};
