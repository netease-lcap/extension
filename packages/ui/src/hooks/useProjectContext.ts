import { createContext, useCallback, useEffect, useState } from 'react';
import { MaterialSchema, ProjectMetaInfo, getProjectMetaInfo, getProjectSchema } from '../services';

const helpModalSrcMap = {
  ComponentInfo: 'https://netease-lcap.github.io/extension/frontend/component/api.html#%E7%BB%84%E4%BB%B6%E6%8F%8F%E8%BF%B0',
  ComponentProp: 'https://netease-lcap.github.io/extension/frontend/component/api.html#%E5%B1%9E%E6%80%A7%E6%8F%8F%E8%BF%B0-%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE',
  ComponentEvent: 'https://netease-lcap.github.io/extension/frontend/component/api.html#%E4%BA%8B%E4%BB%B6%E6%8F%8F%E8%BF%B0',
  ComponentSlot: 'https://netease-lcap.github.io/extension/frontend/component/api.html#%E6%8F%92%E6%A7%BD%E6%8F%8F%E8%BF%B0',
  ComponentMethod: 'https://netease-lcap.github.io/extension/frontend/component/api.html#%E6%96%B9%E6%B3%95%E6%8F%8F%E8%BF%B0',
  ComponentReadableProp: 'https://netease-lcap.github.io/extension/frontend/component/platform/accessibility.html',
  ComponentIdeUsage: 'https://netease-lcap.github.io/extension/frontend/component/ide.html',
};

export interface ProjectContextType {
  metaInfo?: ProjectMetaInfo;
  schema?: MaterialSchema;
  openHelpModal: (key?: string) => void;
}

export const ProjectContext = createContext<ProjectContextType>({
  openHelpModal: () => {},
});

export const useProjectContextProvider = () => {
  const [metaInfo, setMetaInfo] = useState<ProjectMetaInfo>();
  const [schema, setSchema] = useState<MaterialSchema>();
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [helpSrc, setHelpSrc] = useState('https://netease-lcap.github.io/extension/frontend/introduction.html');

  const loadProjectMetaInfo = useCallback(async () => {
    const res = await getProjectMetaInfo();
    if (res) {
      setMetaInfo(res);
    }
  }, []);


  const loadProjectSchema = useCallback(async () => {
    const res = await getProjectSchema();
    if (res) {
      setSchema(res);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadProjectMetaInfo(), loadProjectSchema()]);
  }, []);

  const openHelpModal = useCallback((key?: keyof typeof helpModalSrcMap) => {
    setHelpModalVisible(true);
    if (key && helpModalSrcMap[key]) {
      setHelpSrc(helpModalSrcMap[key]);
    }
  }, []);

  const closeHelpModal = useCallback(() => {
    setHelpModalVisible(false);
  }, []);

  return {
    metaInfo,
    schema,
    openHelpModal,
    closeHelpModal,
    helpModalVisible,
    helpSrc,
  };
};
