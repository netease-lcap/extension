import { createContext, useContext } from 'react';
import { ComponentMetaInfo } from '../services';
import { NaslComponent } from '../types/component';

export interface ComponentContextProps {
  componentList: ComponentMetaInfo[];
  hiddenList: any[];
  component: NaslComponent | null;
}

export const ComponentContext = createContext<ComponentContextProps>({
  componentList: [],
  hiddenList: [],
  component: null,
});

export const useComponentContext = () => {
  return useContext(ComponentContext);
};

export default ComponentContext;
