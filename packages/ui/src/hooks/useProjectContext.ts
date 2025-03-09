import { createContext, useCallback, useEffect, useState } from 'react';
import { MaterialSchema, ProjectMetaInfo, getProjectMetaInfo, getProjectSchema } from '../services';

export interface ProjectContextType {
  metaInfo?: ProjectMetaInfo;
  schema?: MaterialSchema;
}

export const ProjectContext = createContext<ProjectContextType>({});

export const useProjectContextProvider = () => {
  const [metaInfo, setMetaInfo] = useState<ProjectMetaInfo>();
  const [schema, setSchema] = useState<MaterialSchema>();

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

  return {
    metaInfo,
    schema,
  } as ProjectContextType;
};
