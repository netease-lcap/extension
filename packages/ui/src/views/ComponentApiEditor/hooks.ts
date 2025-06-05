import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { ComponentMetaInfo, createComponent, getComponentDetail, getComponentList, removeComponent, updateComponent } from '../../services';
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
  }, [loadComponentList]);

  useHandleNaslChange(loadComponentList);

  const hiddenList = useMemo(() => {
    if (!schema || schema.components.length === 0) {
      return [];
    }

    return schema.components.map((item) => {
      const comp = componentList.find((component) => component.sourceName === item.name);
      if (comp) {
        return {
          ...item,
          disabled: true,
        };
      }

      return item;
    });
  }, [componentList, schema]);

  return {
    componentList,
    hiddenList,
    loadComponentList,
  };
};

const log = (data: any) => {
  try {
    window.top?.postMessage({ from: 'lcap-api-editor', type: 'log', data: data }, '*');
  } catch (e) {
  }
}

export const useComponentControl = (componentList: ComponentMetaInfo[], loadComponentList: () => void) => {
  const [selected, setSelected] = useState<string>('');
  const [component, setComponent] = useState<NaslComponent | null>(null);
  const [editingName, setEditingName] = useState<string>(selected);
  const [editingModule, setEditingModule] = useState<APIUpdateOptions['module']>('info');

  useEffect(() => {
    if (componentList.length > 0 && (!selected || !componentList.some((item) => selected === item.name))) {
      setSelected(componentList[0].name);
    }
  }, [componentList, selected]);

  const handleAdd = useCallback(async (name: string) => {
    await createComponent(name);
    loadComponentList();

    log({
      type: 'addComponent',
      name,
    });
  }, [loadComponentList]);


  const handleRemove = useCallback(async (name: string) => {
    await removeComponent(name);
    loadComponentList();

    log({
      type: 'removeComponent',
      name,
    });
  }, [loadComponentList]);

  const loadComponent = useCallback(async (name: string) => {
    if (!name) {
      return;
    }

    const component = await getComponentDetail(name);
    setComponent(component);
  }, []);

  useEffect(() => {
    if (selected) {
      loadComponent(selected);
    } else {
      setComponent(null);
    }

    setEditingName(selected);
  }, [selected, loadComponent]);

  useHandleNaslChange(
    useCallback(() => loadComponent(selected), [selected, loadComponent]),
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

    let child = (component.children || []).find((item) => item.name === editingName);

    if (child) {
      child = {
        ...child,
        isChild: true,
      };
    }

    return child;
  }, [component, editingName]);

  const tsPath = useMemo(() => {
    const comp = componentList.find((item) => item.name === selected);

    if (!comp) {
      return '';
    }

    return comp.tsPath;
  }, [componentList, selected]);

  const handleUpdate = useCallback(async (options: APIUpdateOptions | APIUpdateOptions[]) => {
    if (!tsPath || !editComponent?.name) {
      return;
    }

    const actions = Array.isArray(options) ? options : [options];
    const successed = await updateComponent({
      tsPath,
      actions: actions,
    });

    log({
      type: 'updateComponent',
      tsPath,
      actions: actions,
    });

    if (successed) {
      loadComponent(selected);
    }

    return successed;
  }, [tsPath, editComponent?.name, selected, loadComponent]);

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
    updateComponent: handleUpdate,
    setEditingName,
    editTabs,
  };
};
