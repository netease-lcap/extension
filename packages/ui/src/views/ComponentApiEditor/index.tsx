import { useRef, useState, useCallback, useMemo } from 'react';
import { Button, Dropdown, Menu, MenuProps } from 'antd';
import { Allotment, AllotmentHandle } from 'allotment';
import styles from './index.module.less';
import { IconDoubleArrowLeft, IconList, IconArrowDown } from '../../components/icons';
import { ComponentList } from '../../components/ComponentList';
import { APICodeView } from '../../components/APICodeView';
import { ComponentTabs } from '../../components/ComponentTabs';
import { useToggle } from '../../hooks';
import { useComponentList, useComponentControl } from './hooks';

const minSize = 32;

export const ComponentApiEditor = () => {
  const [collapsed, toggleCollapsed] = useToggle(false);
  const [componentSizes, setComponentSizes] = useState([100, 0]);
  const [apiDetailSizes, setApiDetailSizes] = useState([100, 0]);
  const { componentList, hiddenList } = useComponentList();
  const {
    selected,
    editingName,
    component,
    addComponent,
    removeComponent,
    setSelected,
    setEditingName,
  } = useComponentControl(componentList);

  const componentListRef = useRef<AllotmentHandle>(null);
  const apiDetailRef = useRef<AllotmentHandle>(null);
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
        onClick: toggleCollapsed,
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
  }, [toggleCollapsed, componentList]);

  return (
    <div className={`${styles.editor}  ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.componentList}>
        <Allotment vertical defaultSizes={componentSizes} ref={componentListRef} onChange={setComponentSizes} separator={false}>
          <Allotment.Pane minSize={minSize}>
            <div className={styles.configListPanel}>
              <div className={styles.listPanelHeader}>
                <span className={styles.title}>组件（{componentList.length}）</span>
              </div>
              <div className={styles.listPanelContent}>
                <ComponentList value={selected} action="remove" onRemove={removeComponent} componentList={componentList} onChange={setSelected} />
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
            <Button className={styles.toggleBtn} onClick={toggleCollapsed}>
              <IconDoubleArrowLeft />
            </Button>
          )
        }
        <Allotment vertical defaultSizes={apiDetailSizes} ref={apiDetailRef} onChange={setApiDetailSizes} separator={false}>
          <Allotment.Pane minSize={minSize}>
            <div className={styles.detailPanel}>
              <div className={styles.panelHeader}>
                {component && <ComponentTabs component={component} activeKey={editingName} onChange={setEditingName} />}
              </div>
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
      <div className={styles.preview}></div>
    </div>
  );
};

export default ComponentApiEditor;
