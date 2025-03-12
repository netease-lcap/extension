import { useRef, useState, useCallback, useMemo, useContext } from 'react';
import { Button, Dropdown, Menu, MenuProps, Modal, Tabs } from 'antd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { Allotment, AllotmentHandle } from 'allotment';
import { IconDoubleArrowLeft, IconList, IconArrowDown, IconHelpVariant } from '../../components/icons';
import { ComponentList } from '../../components/ComponentList';
import { APICodeView } from '../../components/APICodeView';
import { ComponentTabs } from '../../components/ComponentTabs';
import { useToggle } from '../../hooks';
import ComponentContext from '../../hooks/useComponentContext';
import { useComponentList, useComponentControl } from './hooks';
import { ProjectContext } from '../../hooks/useProjectContext';
import { BaseInfo } from './BaseInfoForm';
import { PropsEditorView } from './PropsEditorView';
import { EventsEditorView } from './EventsEditorView';
import { SlotsEditorView } from './SlotsEditorView';
import { MethodsEditorView } from './MethodsEditorView';
import { ReadablePropsEditorView } from './ReadablePropForm';
import { upperFirst } from 'lodash';
import styles from './index.module.less';

const minSize = 32;
const defaultSidebarSize = 500;
const listPanelWidth = 180;
const defaultLayoutSizes = [defaultSidebarSize, window.innerWidth - defaultSidebarSize];
const stop = (e: React.WheelEvent<HTMLIFrameElement>) => e.stopPropagation();

export const ComponentApiEditor = () => {
  const [modal, modalContextHolder] = Modal.useModal();
  const [collapsed, toggleCollapsed] = useToggle(false);
  const layoutRef = useRef<AllotmentHandle>(null);
  const sidebarSizeRef = useRef<number>(defaultSidebarSize);
  const [componentSizes, setComponentSizes] = useState([100, 0]);
  const [apiDetailSizes, setApiDetailSizes] = useState([100, 0]);
  const { componentList, hiddenList } = useComponentList();
  const { openHelpModal } = useContext(ProjectContext);
  const {
    selected,
    editingName,
    editingModule,
    editComponent,
    component,
    addComponent,
    removeComponent,
    updateComponent,
    setSelected,
    setEditingName,
    setEditingModule,
    editTabs,
  } = useComponentControl(componentList);

  const componentListRef = useRef<AllotmentHandle>(null);
  const apiDetailRef = useRef<AllotmentHandle>(null);

  const handleLayoutChange = useCallback((sizes: number[]) => {
    if (sizes[0] < defaultSidebarSize && !collapsed) {
      toggleCollapsed();
    }

    sidebarSizeRef.current = sizes[0];
  }, [collapsed, toggleCollapsed]);

  const handleComponentClick = () => {
    const maxContent = componentSizes[0] + componentSizes[1];
    const size = Math.floor(maxContent / 2);
    if (componentSizes[1] >= size) {
      componentListRef.current?.resize([maxContent - minSize, minSize]);
    } else {
      componentListRef.current?.resize([maxContent - size, size]);
    }
  };

  const handleApiDetailClick = () => {
    const maxContent = apiDetailSizes[0] + apiDetailSizes[1];
    const size = Math.floor(maxContent / 2);
    if (apiDetailSizes[1] >= size) {
      apiDetailRef.current?.resize([maxContent - minSize, minSize]);
    } else {
      apiDetailRef.current?.resize([maxContent - size, size]);
    }
  };

  const handleToggleCollapsed = useCallback(() => {
    toggleCollapsed();
    const sidebarSize = collapsed ? sidebarSizeRef.current + listPanelWidth : sidebarSizeRef.current - listPanelWidth;
    layoutRef.current?.resize([sidebarSize, window.innerWidth - sidebarSize]);
  }, [collapsed]);

  const componentMenuProps = useMemo(() => {
    const items = componentList.map((item) => ({
      key: item.name,
      label: item.name,
      onClick: () => setSelected(item.name),
    }));

    return {
      items,
    };
  }, [componentList]);

  const renderDropdownMenu = useCallback((menu: React.ReactNode) => {
    const actionMenus: MenuProps['items'] = [
      {
        key: 'divider',
        type: 'divider',
      },
      {
        key: 'collapsed',
        label: '展开组件列表',
        onClick: handleToggleCollapsed,
      },
    ];


    return (
      <div className={styles.toggleMenu}>
        <div className={styles.header}>
          组件（{componentList.length}）
        </div>
        <div className={styles.menus}>
          {menu}
        </div>
        <Menu items={actionMenus}/>
      </div>
    )
  }, [handleToggleCollapsed, componentList]);

  const handleRemoveComponent = (name: string) => {
    modal.confirm({
      title: `确定删除组件“${name}”吗？`,
      onOk: () => {
        removeComponent(selected);
      },
    });
  };

  const handleRemoveChildComponent = useCallback((name: string) => {
    if (!component) {
      return;
    }

    modal.confirm({
      title: `确定删除子组件“${name}”吗？`,
      onOk: async () => {
        await updateComponent({
          type: 'remove',
          module: 'subComponent',
          name: component.name,
          data: {
            name,
          },
        });

        setEditingName(component.name);
      },
    });

  }, [
    component?.name,
    updateComponent,
  ]);

  const handleOpenHelp = useCallback(() => {
    openHelpModal(`Component${upperFirst(editingModule)}`);
  }, [editingModule, openHelpModal]);

  const contextValue = useMemo(() => ({
    componentList,
    hiddenList,
    component: editComponent,
    updateComponent,
    modal
  }), [
    componentList,
    hiddenList,
    editComponent,
    updateComponent,
    modal,
  ]);

  return (
    <>
      <ComponentContext.Provider value={contextValue as any}>
          <Allotment ref={layoutRef} defaultSizes={defaultLayoutSizes} separator={false} onChange={handleLayoutChange}>
            <Allotment.Pane minSize={320}>
              <div className={`${styles.editor}  ${collapsed ? styles.collapsed : ''}`}>
                <div className={styles.componentList}>
                  <Allotment vertical defaultSizes={componentSizes} ref={componentListRef} onChange={setComponentSizes} separator={false}>
                    <Allotment.Pane minSize={minSize}>
                      <div className={styles.configListPanel}>
                        <div className={styles.listPanelHeader}>
                          <span className={styles.title}>组件（{componentList.length}）</span>
                        </div>
                        <div className={styles.listPanelContent}>
                          <ComponentList value={selected} action="remove" onRemove={handleRemoveComponent} componentList={componentList} onChange={setSelected} />
                        </div>
                      </div>
                    </Allotment.Pane>
                    <Allotment.Pane minSize={minSize}>
                      <div className={styles.configListPanel}>
                        <div className={`${styles.listPanelHeader} ${styles.collapse}`} onClick={handleComponentClick}>
                          <span className={styles.title}>隐藏组件 ({hiddenList.length})</span>
                          <div className={`${styles.action} ${componentSizes[1] > minSize ? styles.up : ''}`}>
                            <IconArrowDown />
                          </div>
                        </div>
                        <div className={styles.listPanelContent}>
                          <ComponentList action="add" onAdd={addComponent} componentList={hiddenList} selectable={false} />
                        </div>
                      </div>
                    </Allotment.Pane>
                  </Allotment>
                </div>
                <div className={styles.componentDetail}>
                  {
                    collapsed ? (
                      <Dropdown
                        menu={componentMenuProps}
                        dropdownRender={renderDropdownMenu}
                        trigger={['click']}
                      >
                        <Button className={styles.toggleBtn}>
                          <IconList />
                        </Button>
                      </Dropdown>
                    ) : (
                      <Button className={styles.toggleBtn} onClick={handleToggleCollapsed}>
                        <IconDoubleArrowLeft />
                      </Button>
                    )
                  }
                  <Allotment vertical defaultSizes={apiDetailSizes} ref={apiDetailRef} onChange={setApiDetailSizes} separator={false}>
                    <Allotment.Pane minSize={minSize}>
                      <div className={styles.detailPanel}>
                        <div className={styles.panelHeader}>
                          {
                            component && (
                              <ComponentTabs
                                component={component}
                                activeKey={editingName}
                                onChange={setEditingName}
                                onRemove={handleRemoveChildComponent}
                              />
                            )
                          }
                        </div>
                        <Tabs size="small" className={styles.panelSubHeader} items={editTabs} activeKey={editingModule} onChange={setEditingModule as any} />
                        <DndProvider backend={HTML5Backend}>
                          <div className={styles.detailPanelContent}>
                            <div className={styles.helpBlock}>
                              <Button color="primary" size="small" variant="link" className={styles.helpBtn} onClick={handleOpenHelp}>
                                <IconHelpVariant />
                                关于{editTabs.find((tab) => tab.key === editingModule)?.label}
                              </Button>
                            </div>
                            {editingModule === 'info' && <BaseInfo removeSubComponent={handleRemoveChildComponent} />}
                            {editingModule === 'prop' && <PropsEditorView />}
                            {editingModule === 'event' && <EventsEditorView />}
                            {editingModule === 'slot' && <SlotsEditorView />}
                            {editingModule === 'method' && <MethodsEditorView />}
                            {editingModule === 'readableProp' && <ReadablePropsEditorView />}
                          </div>
                        </DndProvider>
                      </div>
                    </Allotment.Pane>
                    <Allotment.Pane minSize={minSize}>
                      <div className={styles.apiDetailPanel}>
                        <div className={styles.panelHeader} onClick={handleApiDetailClick}>
                          <span className={styles.title}>在线代码生成</span>

                          <div className={`${styles.action} ${apiDetailSizes[1] > minSize ? styles.up : ''}`}>
                            <IconArrowDown />
                          </div>
                        </div>
                        <div className={styles.apiDetailContent}>
                          <APICodeView name={selected} />
                        </div>
                      </div>
                    </Allotment.Pane>
                  </Allotment>
                </div>
              </div>
            </Allotment.Pane>
            <Allotment.Pane minSize={204}>
              <iframe width="100%" onWheel={stop} onWheelCapture={stop} height="100%" style={{ border: 'none' }} src={`https://localhost:3000/designer/uidev?appId=demo&branch=feauter-uidev314`} />
            </Allotment.Pane>
          </Allotment>
      </ComponentContext.Provider>
      {modalContextHolder}
    </>
  );
};

export default ComponentApiEditor;
