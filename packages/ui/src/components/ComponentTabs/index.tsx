import { Dropdown, Tabs, TabsProps, Input, Button, Flex } from 'antd';
import { FC, useMemo, useCallback, useState } from 'react';
import { NaslComponent } from '../../types/component';
import styles from './index.module.less';
import classNames from 'classnames';
import { IconAdd } from '../icons';
import { camelCase, upperFirst } from 'lodash';
import { useComponentContext } from '../../hooks';

export interface ComponentTabsProps {
  component: NaslComponent;
  activeKey: string;
  onChange: (key: string) => void;
}

const AddSubComponent = ({ name: componentName }: { name?: string }) => {
  const { updateComponent } = useComponentContext();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');

  const handleOpenChange = (op: boolean) => {
    if (op) {
      setValue('');
    }

    setOpen(op);
  }

  const handleConfirm = useCallback(async() => {
    const name = upperFirst(camelCase(value.trim()));
    if (!name || !componentName) {
      setOpen(false);
      return;
    }

    setValue(name);
    setAdding(true);

    await updateComponent({
      type: 'add',
      module: 'subComponent',
      name: componentName,
      data: {
        name,
      },
    });
    setAdding(false);
    setOpen(false);
  }, [value, setOpen]);

  const close = useCallback(() => setOpen(false), []);

  const renderDropdownMenu = useCallback(() => {
    return (
      <div className={styles.addConfirm}>
        <Input
          placeholder={`请输入组件名称 (例如： ${componentName}Item)`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Flex justify="flex-end" align="center" gap={8} className={styles.footer}>
          <Button onClick={close}>取消</Button>
          <Button type="primary" loading={adding} onClick={handleConfirm}>确定</Button>
        </Flex>
      </div>
    )
  }, [value, close, handleConfirm]);

  return (
    <div className={styles.addTab}>
      <Dropdown open={open} onOpenChange={handleOpenChange} trigger={['click']} placement="bottomCenter" dropdownRender={renderDropdownMenu}>
        <IconAdd />
      </Dropdown>
    </div>
  )
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

  const tabBarExtraContent = useMemo(() => ({
    right: (
      <AddSubComponent name={component.name} />
    ),
  }), []);

  return (
    <Tabs
      type="card"
      items={items}
      tabBarExtraContent={tabBarExtraContent}
      className={styles.tabs}
      activeKey={activeKey}
      onChange={onChange}
    />
  )
}

export default ComponentTabs;
