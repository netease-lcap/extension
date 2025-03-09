import { Tabs, TabsProps } from 'antd';
import { FC, useMemo } from 'react';
import { NaslComponent } from '../../types/component';
import styles from './index.module.less';
import classNames from 'classnames';
import { IconAdd } from '../icons';

export interface ComponentTabsProps {
  component: NaslComponent;
  activeKey: string;
  onChange: (key: string) => void;
}

export const ComponentTabs: FC<ComponentTabsProps> = ({ component, activeKey, onChange }) => {
  const items = useMemo(() => {
    const list: TabsProps['items'] = [{
      label: (
        <div className={styles.tabItem}>
          <span className={classNames(styles.badge, styles.primary)}>主</span>
          <span className={styles.name}>{component.name}</span>
        </div>
      ),
      key: component.name,
      closable: false,
    }];

    if (component.children && component.children.length > 0) {
      component.children.forEach((child) => {
        list.push({
          label: (
            <div className={styles.tabItem}>
              <span className={classNames(styles.badge, styles.secondary)}>子</span>
              <span className={styles.name}>{child.name}</span>
            </div>
          ),
          key: child.name,
          closable: false,
        });
      });
    }

    return list;
  }, [component]);

  return (
    <Tabs
      type="card"
      items={items}
      tabBarExtraContent={{
        right: (
          <div className={styles.addTab}>
            <IconAdd />
          </div>
        ),
      }}
      className={styles.tabs}
      activeKey={activeKey}
      onChange={onChange}
    />
  )
}

export default ComponentTabs;
