import { updateComponent } from '../services';
import { APIUpdateOptions, NaslComponent } from '../types/component';
import { useCallback, useState } from 'react';
import { useSocket } from './useSocket';

export const useComponentUpdate = (component: NaslComponent, callback: () => void) => {
  const [updating, setUpdating] = useState(false);

  const handleUpdate = useCallback(async (options: APIUpdateOptions) => {
    setUpdating(true);
    const successed = await updateComponent(options);
    setUpdating(false);

    if (successed) {
      callback();
    }
  }, [component, callback]);

  useSocket(useCallback((message) => {
    if (message === 'nasl.ui' || message === 'nasl.extension') {
      callback();
    }
  }, [callback]));

  return {
    updateComponent: handleUpdate,
    updating,
  };
}
