import { createContext, useContext } from 'react';
import { ComponentMetaInfo } from '../services';
import { APIUpdateOptions, NaslComponent } from '../types/component';

export interface ComponentContextProps {
  componentList: ComponentMetaInfo[];
  hiddenList: any[];
  component: NaslComponent | null;
  updateComponent: (options: (APIUpdateOptions | APIUpdateOptions[])) => Promise<boolean>;
}

export const ComponentContext = createContext<ComponentContextProps>({
  componentList: [],
  hiddenList: [],
  component: null,
  updateComponent: (() => {}) as any,
});

export const useComponentContext = () => {
  return useContext(ComponentContext);
};

export default ComponentContext;
