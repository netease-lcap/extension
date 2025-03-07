import { useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { Allotment, AllotmentHandle } from 'allotment';
import styles from './index.module.less';
import { IconDoubleArrowLeft, IconList, IconArrowDown } from '../../components/icons';
import { useToggle } from '../../hooks';
const minSize = 32;

export const ComponentApiEditor = () => {
  const [collapsed, toggleCollapsed] = useToggle(false);
  const [componentSizes, setComponentSizes] = useState([100, 0]);
  const [apiDetailSizes, setApiDetailSizes] = useState([100, 0]);

  const componentListRef = useRef<AllotmentHandle>(null);
  const apiDetailRef = useRef<AllotmentHandle>(null);
  const handleComponentClick = () => {
    const maxContent = componentSizes[0] + componentSizes[1];
    if (componentSizes[1] >= maxContent / 2) {

      componentListRef.current?.resize([maxContent - minSize, minSize]);
    } else {
      componentListRef.current?.resize([maxContent / 2, maxContent / 2]);
    }
  };

  const handleApiDetailClick = () => {
    const maxContent = apiDetailSizes[0] + apiDetailSizes[1];
    if (apiDetailSizes[1] >= maxContent / 2) {
      apiDetailRef.current?.resize([maxContent - minSize, minSize]);
    } else {
      apiDetailRef.current?.resize([maxContent / 2, maxContent / 2]);
    }
  };

  useEffect(() => {
    console.log(componentSizes);
  }, [componentSizes]);

  return (
    <div className={`${styles.editor}  ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.componentList}>
        <Allotment vertical defaultSizes={componentSizes} ref={componentListRef} onChange={setComponentSizes} separator={false}>
          <Allotment.Pane minSize={minSize}>
            <div className={styles.configListPanel}>
              <div className={styles.listPanelHeader}>
                <span className={styles.title}>组件（3）</span>
              </div>
            </div>
          </Allotment.Pane>
          <Allotment.Pane minSize={minSize}>
            <div className={styles.configListPanel}>
              <div className={`${styles.listPanelHeader} ${styles.collapse}`} onClick={handleComponentClick}>
                <span className={styles.title}>隐藏组件 (3)</span>
                <div className={`${styles.action} ${componentSizes[1] > minSize ? styles.up : ''}`}>
                  <IconArrowDown />
                </div>
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
      <div className={styles.componentDetail}>
        <Button className={styles.toggleBtn} onClick={toggleCollapsed}>
          { collapsed ? <IconList /> : <IconDoubleArrowLeft /> }
        </Button>
        <Allotment vertical defaultSizes={apiDetailSizes} ref={apiDetailRef} onChange={setApiDetailSizes} separator={false}>
          <Allotment.Pane minSize={minSize}>
            <div className={styles.detailPanel}>
              <div className={styles.panelHeader}>
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
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
      <div className={styles.preview}></div>
    </div>
  );
};

export default ComponentApiEditor;
