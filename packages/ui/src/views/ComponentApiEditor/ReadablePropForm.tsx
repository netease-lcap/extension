import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Divider, Dropdown } from 'antd';
import type { PropDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext } from '../../hooks';
import { ComponentField, IconAdd, ReadablePropForm } from '../../components';
import { isCamelCase } from '../../utils/check';
import styles from './index.module.less';

export const AddReadableProp = () => {
  const { component, updateComponent } = useComponentContext();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAddConfirm = useCallback(async(name: string) => {
    if (!component?.name) {
      return;
    }

    if (!isCamelCase(name)) {
      setError('请输入小驼峰的变量名称，例如：myName');
      return;
    }

    if (component?.readableProps.some((prop: any) => prop.name === name)) {
      setError('该变量名称已存在');
      return;
    }

    setError('');

    await updateComponent({
      type: 'add',
      module: 'readableProp',
      name: component.name,
      data: {
        name,
      },
    });

    setVisible(false);
  }, [component?.readableProps, component?.name, updateComponent]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setName('');
      setError('');
    }

    setVisible(open);
  }, []);

  const renderDropdownMenu = useCallback((menu: React.ReactNode) => {
    return (
      <div className={styles.toggleMenu}>
        <div className={styles.menus}>
          {menu}
        </div>
        <Divider style={{ margin: 0 }} />
        <div className={styles.footer}>
          <Input size="small" status={error ? 'error' : ''} value={name} onChange={(e) => setName(e.target.value)} style={{ width: 92, flex: 1 }} placeholder="请输入变量名称" />
          {error && <div className={styles.error}>{error}</div>}
          <Button variant="text" color="primary" className={styles.textBtn} onClick={() => handleAddConfirm(name)}>
            <span>确定</span>
          </Button>
          <Button variant="text" color="primary" className={styles.textBtn} onClick={() => setVisible(false)}>
            <span>取消</span>
          </Button>
        </div>
      </div>
    )
  }, [
    handleAddConfirm,
    name,
    setName,
    error,
  ]);


  return (
    <Dropdown open={visible} onOpenChange={handleOpenChange} trigger={['click']} menu={{}} dropdownRender={renderDropdownMenu}>
      <Button block color="primary" variant="outlined">
        <IconAdd />
        <span>添加变量</span>
      </Button>
    </Dropdown>
  )
}

export const ReadablePropsEditorView = () => {
  const { component, updateComponent, modal } = useComponentContext();
  const [readableProps, setReadableProps] = useState<PropDeclaration[]>([]);

  useEffect(() => {
    setReadableProps(component?.readableProps || []);
  }, [component?.readableProps]);

  const handleRemoveProp = useCallback((name: string) => {
    if (!component?.name) {
      return;
    }

    modal.confirm({
      title: `确定删除变量 ”${name}“ 吗？`,
      centered: true,
      onOk: async () => {
        await updateComponent({
          type: 'remove',
          module: 'readableProp',
          name: component.name,
          propName: name,
        });
      },
    });
  }, [component?.name, updateComponent, modal]);

  const handleMoveProp = useCallback(async (sourceItem: { group: string, name: string }, target: { group: string, name?: string }) => {
    if (!component || !component.name) {
      return;
    }

    const items = [...readableProps];
    const sourceIndex = items.findIndex((prop) => prop.name === sourceItem.name);
    const targetIndex = items.findIndex((prop) => prop.name === target.name);

    if (sourceIndex === targetIndex || sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    const temp = items[sourceIndex];
    items[sourceIndex] = items[targetIndex];
    items[targetIndex] = temp;

    setReadableProps(items);
    await updateComponent({
      type: 'order',
      module: 'readableProp',
      name: component?.name || '',
      data: {
        names: [
          ...items.map((prop) => prop.name),
        ],
        isOptions: false,
      },
    });

  }, [component, updateComponent, readableProps]);


  return (
    <div>
      {
        readableProps.map((propData) => (
          <ComponentField key={propData.name} name={propData.name}  onRemove={handleRemoveProp} onMove={handleMoveProp}>
            <ReadablePropForm propData={propData} />
          </ComponentField>
        ))
      }
      <AddReadableProp />
    </div>
  );
};
