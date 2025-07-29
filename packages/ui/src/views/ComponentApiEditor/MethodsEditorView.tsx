import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Input, Divider, Dropdown } from 'antd';
import type { LogicDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext, useProjectContext } from '../../hooks';
import { ComponentField, IconAdd, MethodForm } from '../../components';
import { isCamelCase } from '../../utils/check';
import styles from './index.module.less';

export const AddMethod = ({ sourceName }: { sourceName?: string }) => {
  const { getComponentSchema } = useProjectContext();
  const { component, updateComponent } = useComponentContext();
  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const schemamethods = useMemo(() => {
    if (!sourceName) {
      return [];
    }

    const schema = getComponentSchema(sourceName);
    if (!schema) {
      return [];
    }

    return schema.methods || [];
  }, [sourceName, getComponentSchema]);

  const handleAddConfirm = useCallback(async(name: string) => {
    if (!component?.name) {
      return;
    }

    if (!isCamelCase(name)) {
      setError('请输入小驼峰的方法名称，例如：myName');
      return;
    }

    if (component?.methods.some((prop: any) => prop.name === name)) {
      setError('该方法名称已存在');
      return;
    }

    setError('');

    await updateComponent({
      type: 'add',
      module: 'method',
      name: component.name,
      data: {
        name,
      },
    });

    setVisible(false);
  }, [component?.methods, component?.name, updateComponent]);

  const handleAddSchemaProp = useCallback(async (propSchema: any) => {
    if (!component?.name) {
      return;
    }

    await updateComponent({
      type: 'add',
      module: 'method',
      name: component.name,
      data: {
        name: propSchema.name,
        schema: propSchema,
      },
    });
  }, [component?.name, updateComponent]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setAdding(schemamethods.length > 0 ? false : true);
      setName('');
      setError('');
    }

    setVisible(open);
  }, [schemamethods]);

  const menuProps = useMemo(() => {
    const items = schemamethods.map((item: any) => ({
      key: item.name,
      label: item.name,
      disabled: component?.methods.some((prop: any) => prop.name === item.name),
      onClick: () => handleAddSchemaProp(item),
    }));

    return {
      items,
    };
  }, [schemamethods, component?.methods, handleAddSchemaProp]);


  const renderDropdownMenu = useCallback((menu: React.ReactNode) => {
    return (
      <div className={styles.toggleMenu}>
        <div className={styles.menus}>
          {menu}
        </div>
        <Divider style={{ margin: 0 }} />
        <div className={styles.footer}>
          {
            adding ? (
              <>
                <Input size="small" status={error ? 'error' : ''} value={name} onChange={(e) => setName(e.target.value)} style={{ width: 92, flex: 1 }} placeholder="请输入方法名称" />
                {error && <div className={styles.error}>{error}</div>}
                <Button variant="text" color="primary" className={styles.textBtn} onClick={() => handleAddConfirm(name)}>
                  <span>确定</span>
                </Button>
                <Button variant="text" color="primary" className={styles.textBtn} onClick={() => schemamethods.length > 0 ? setAdding(false) : setVisible(false)}>
                  <span>取消</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => setAdding(true)} variant="text" color="primary" className={styles.textBtn}>
                <IconAdd />
                <span>自定义方法</span>
              </Button>
            )
          }
        </div>
      </div>
    )
  }, [
    adding,
    setAdding,
    schemamethods,
    handleAddConfirm,
    name,
    setName,
    error,
  ]);


  return (
    <Dropdown open={visible} onOpenChange={handleOpenChange} trigger={['click']} menu={menuProps} dropdownRender={renderDropdownMenu}>
      <Button block color="primary" variant="outlined">
        <IconAdd />
        <span>添加方法</span>
      </Button>
    </Dropdown>
  )
}

export const MethodsEditorView = () => {
  const { component, updateComponent, modal } = useComponentContext();
  const [methods, setMethods] = useState<LogicDeclaration[]>([]);

  useEffect(() => {
    setMethods(component?.methods || []);
  }, [component?.methods]);

  const handleRemoveMethod = useCallback((name: string) => {
    if (!component?.name) {
      return;
    }

    modal.confirm({
      title: `确定删除方法 ”${name}“ 吗？`,
      centered: true,
      onOk: async () => {
        await updateComponent({
          type: 'remove',
          module: 'method',
          name: component.name,
          propName: name,
        });
      },
    });
  }, [component?.name, updateComponent, modal]);

  const handleMoveProp = useCallback(async (sourceItem: { group: string, name: string }, target: { group: string, name?: string }, position: 'up' | 'down' = 'up') => {
    if (!component || !component.name) {
      return;
    }

    const items = [...methods];
    const sourceIndex = items.findIndex((method) => method.name === sourceItem.name);
    const srcItem = items[sourceIndex];

    items.splice(sourceIndex, 1);

    const targetIndex = items.findIndex((method) => method.name === target.name);

    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    if (position === 'up') {
      items.splice(targetIndex, 0, srcItem);
    } else {
      items.splice(targetIndex + 1, 0, srcItem);
    }

    setMethods(items);
    await updateComponent({
      type: 'order',
      module: 'method',
      name: component?.name || '',
      data: {
        names: [
          ...(component.readableProps || []).map((p) => p.name),
          ...items.map((method) => method.name),
        ],
        isOptions: false,
      },
    });

  }, [component, updateComponent, methods]);


  return (
    <div>
      {
        methods.map((methodData) => (
          <ComponentField key={methodData.name} name={methodData.name}  onRemove={handleRemoveMethod} onMove={handleMoveProp}>
            <MethodForm methodData={methodData} />
          </ComponentField>
        ))
      }
      <AddMethod sourceName={component?.sourceName} />
    </div>
  );
};
