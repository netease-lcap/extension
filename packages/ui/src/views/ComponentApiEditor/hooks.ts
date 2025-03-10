import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { ComponentMetaInfo, createComponent, getComponentDetail, getComponentList, removeComponent } from '../../services';
import { ProjectContext, useHandleNaslChange } from '../../hooks';
import { APIUpdateOptions, NaslComponent } from '../../types/component';

export const useComponentList = () => {
  const { schema } = useContext(ProjectContext);
  const [componentList, setComponentList] = useState<ComponentMetaInfo[]>([]);

  const loadComponentList = useCallback(() => {
    getComponentList().then((list) => {
      setComponentList(list);
    });
  }, []);

  useEffect(() => {
    loadComponentList();
  }, []);

  useHandleNaslChange(loadComponentList);

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
  const [editingModule, setEditingModule] = useState<APIUpdateOptions['module']>('info');

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
    if (!name) {
      return;
    }

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

  useHandleNaslChange(
    useCallback(() => loadComponent(selected), [selected]),
  );

  useEffect(() => {
    setEditingModule('info');
  }, [editingName]);

  const editTabs = useMemo(() => {
    return [
      {
        key: 'info',
        label: '组件信息',
      },
      {
        key: 'prop',
        label: '属性',
      },
      {
        key: 'event',
        label: '事件',
      },
      {
        key: 'slot',
        label: '插槽',
      },
      {
        key: 'readableProp',
        label: '变量',
      },
      {
        key: 'method',
        label: '方法',
      },
    ]
  }, []);

  const editComponent = useMemo(() => {
    if (!component) {
      return null;
    }

    if (component.name === editingName) {
      return component;
    }

    return (component.children || []).find((item) => item.name === editingName);
  }, [component, editingName]);

  return {
    component,
    selected,
    editingName: editingName || selected,
    editingModule,
    editComponent,
    setSelected,
    setEditingModule,
    addComponent: handleAdd,
    removeComponent: handleRemove,
    setEditingName,
    editTabs,
  };
};
