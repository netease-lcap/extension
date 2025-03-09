import { createContext, useContext } from 'react';
import { ComponentMetaInfo } from '../services';

export interface ComponentContextProps {
  componentList: ComponentMetaInfo[];
  hiddenList: any[];
}

export const ComponentContext = createContext<ComponentContextProps>({
  componentList: [],
  hiddenList: [],
});

export const useComponentContext = () => {
  return useContext(ComponentContext);
};

export default ComponentContext;
