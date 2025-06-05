import { Dropdown, Tabs, TabsProps, Input, Button, Flex } from 'antd';
import { FC, useMemo, useCallback, useState } from 'react';
import { NaslComponent } from '../../types/component';
import styles from './index.module.less';
import classNames from 'classnames';
import { IconAdd, IconMore } from '../icons';
import { camelCase, upperFirst } from 'lodash';
import { useComponentContext } from '../../hooks';

export interface ComponentTabsProps {
  component: NaslComponent;
  activeKey: string;
  onChange: (key: string) => void;
  onRemove: (name: string) => void;
}

const AddSubComponent = ({ name: componentName }: { name?: string }) => {
  const { updateComponent, componentList } = useComponentContext();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (op: boolean) => {
    console.log('handleOpenChange', op);
    if (op) {
      setValue('');
      setError(null);
    }

    setOpen(op);
  }

  const handleConfirm = useCallback(async() => {
    const name = upperFirst(camelCase(value.trim()));
    if (!name || !componentName) {
      setError('请输入组件名称');
      return;
    }

    setValue(name);

    if (componentList.some((item) => (item.name === name) || (item.children && item.children.some((child) => child.name === name)))) {
      setError('组件名称已存在');
      return;
    }

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
  }, [value, setOpen, updateComponent, componentName, componentList]);

  const close = useCallback(() => setOpen(false), []);

  const renderDropdownMenu = useCallback(() => {
    return (
      <div className={styles.addConfirm}>
        <Input
          placeholder={`请输入组件名称 (例如： ${componentName}Item)`}
          value={value}
          status={error ? 'error' : undefined}
          onChange={(e) => setValue(e.target.value)}
        />
        <Flex justify="flex-end" align="center" gap={8} className={styles.footer}>
          <Button onClick={close}>取消</Button>
          <Button type="primary" loading={adding} onClick={handleConfirm}>确定</Button>
        </Flex>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    )
  }, [value, close, handleConfirm, componentName, adding, error]);

  return (
    <div className={styles.addTab}>
      <Dropdown open={open} onOpenChange={handleOpenChange} trigger={['click']} placement="bottomCenter" dropdownRender={renderDropdownMenu}>
        <IconAdd />
      </Dropdown>
    </div>
  )
}

const stopPropagation = (e: any) => {
  e?.stopPropagation();
}

export const ComponentTabs: FC<ComponentTabsProps> = ({ component, activeKey, onChange, onRemove }) => {
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
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: '删除子组件',
                      danger: true,
                      onClick: () => {
                        onRemove(child.name);
                      },
                    },
                  ],
                  style: {
                    width: 120,
                  },
                }}
                dropdownRender={(menu) => (
                  <div onClick={stopPropagation}>{menu}</div>
                )}
              >
                <div className={styles.more} onClick={stopPropagation}>
                  <IconMore />
                </div>
              </Dropdown>
            </div>
          ),
          key: child.name,
          closable: false,
        });
      });
    }

    return list;
  }, [component, onRemove]);

  const tabBarExtraContent = useMemo(() => ({
    right: (
      <AddSubComponent name={component.name} />
    ),
  }), [component.name]);

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
