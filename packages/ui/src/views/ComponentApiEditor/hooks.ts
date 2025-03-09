import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { ComponentMetaInfo, createComponent, getComponentDetail, getComponentList, removeComponent } from '../../services';
import { ProjectContext, useSocket } from '../../hooks';
import { NaslComponent } from '../../types/component';

export const useComponentList = () => {
  const { schema } = useContext(ProjectContext);
  const [componentList, setComponentList] = useState<ComponentMetaInfo[]>([]);

  useEffect(() => {
    getComponentList().then((list) => {
      setComponentList(list);
    });
  }, []);

  const handleSocketMessage = useCallback((message: string) => {
    if (message === 'nasl.ui' || message === 'nasl.extension') {
      getComponentList().then((list) => {
        setComponentList(list);
      });
    }
  }, []);

  useSocket(handleSocketMessage);

  const hiddenList = useMemo(() => {
    if (!schema || schema.components.length === 0) {
      return [];
    }

    return schema.components.filter((item) => {
      return !componentList.find((component) => component.sourceName === item.name);
    });
  }, [componentList, schema]);

  return {
    componentList,
    hiddenList,
  };
};

export const useComponentControl = (componentList: ComponentMetaInfo[]) => {
  const [selected, setSelected] = useState<string>('');
  const [component, setComponent] = useState<NaslComponent | null>(null);
  const [editingName, setEditingName] = useState<string>(selected);

  useEffect(() => {
    if (componentList.length > 0 && (!selected || !componentList.some((item) => selected === item.name))) {
      setSelected(componentList[0].name);
    }
  }, [componentList, selected]);

  const handleAdd = async (name: string) => {
    await createComponent(name);
  };

  const handleRemove = async (name: string) => {
    await removeComponent(name);
  };

  const loadComponent = async (name: string) => {
    const component = await getComponentDetail(name);
    setComponent(component);
  };

  useEffect(() => {
    if (selected) {
      loadComponent(selected);
    } else {
      setComponent(null);
    }

    setEditingName(selected);
  }, [selected]);


  return {
    component,
    selected,
    editingName: editingName || selected,
    setSelected,
    addComponent: handleAdd,
    removeComponent: handleRemove,
    setEditingName,
  };
};
