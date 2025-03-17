import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Input, Divider, Dropdown } from 'antd';
import type { SlotDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext, useProjectContext } from '../../hooks';
import { ComponentField, IconAdd, SlotForm } from '../../components';
import { isCamelCase } from '../../utils/check';
import { normalizeEventName, normalizeSlotName } from '../../utils/nasl';
import styles from './index.module.less';
import { APIUpdateOptions } from '../../types/component';

const useSlotActionHook = () => {
  const { component } = useComponentContext();

  return useCallback((action: APIUpdateOptions) => {
    if (!component?.name) {
      return [];
    }

    const actions: APIUpdateOptions[] = [
      action,
    ];

   if (action.type === 'add') {
    if (!component.ideusage) {
      actions.push({
        type: 'update',
        module: 'info',
        name: component.name,
        data: {
          ideusage: {
            idetype: 'container',
          },
        },
      });
    } else if (component.ideusage.idetype === 'element') {
      actions.push({
        type: 'update',
        module: 'info',
        name: component.name,
        data: {
          ideusage: {
            ...component.ideusage,
            idetype: 'container',
          },
        },
        });
      }
    } else if (action.type === 'remove' && component.ideusage && component.ideusage.idetype === 'container') {
      actions.push({
        type: 'update',
        module: 'info',
        name: component.name,
        data: {
          ideusage: {
            ...component.ideusage,
            idetype: 'element',
          },
        },
      });
    }

    return actions;
  }, [component?.name, component?.ideusage]);
};

export const AddSlot = ({ sourceName }: { sourceName?: string }) => {
  const { getComponentSchema } = useProjectContext();
  const { component, updateComponent } = useComponentContext();
  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const schemaSlots = useMemo(() => {
    if (!sourceName) {
      return [];
    }

    const schema = getComponentSchema(sourceName);
    if (!schema) {
      return [];
    }

    return schema.slots || [];
  }, [sourceName, getComponentSchema]);

  const getSlotOptionActions = useSlotActionHook();

  const handleAddConfirm = useCallback(async(name: string) => {
    if (!component?.name) {
      return;
    }

    if (!isCamelCase(name)) {
      setError('请输入小驼峰的插槽名称，例如：myName');
      return;
    }

    if (component?.slots.some((prop: any) => prop.name === name)) {
      setError('该插槽名称已存在');
      return;
    }

    setError('');

    await updateComponent(getSlotOptionActions({
      type: 'add',
      module: 'slot',
      name: component.name,
      data: { name },
    }));

    setVisible(false);
  }, [
    component?.slots,
    component?.name,
    updateComponent,
    getSlotOptionActions,
  ]);

  const handleAddSchemaProp = useCallback(async (propSchema: any) => {
    if (!component?.name) {
      return;
    }

    await updateComponent(getSlotOptionActions({
      type: 'add',
      module: 'slot',
      name: component.name,
      data: {
        name: propSchema.name,
        schema: propSchema,
      },
    }));
  }, [component?.name, updateComponent, getSlotOptionActions]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setAdding(schemaSlots.length > 0 ? false : true);
      setName('');
      setError('');
    }

    setVisible(open);
  }, [schemaSlots]);

  const menuProps = useMemo(() => {
    const items = schemaSlots.map((item: any) => ({
      key: item.name,
      label: item.name,
      disabled: component?.slots.some((prop: any) => prop.name === item.name),
      onClick: () => handleAddSchemaProp(item),
    }));

    return {
      items,
    };
  }, [schemaSlots, component?.slots, handleAddSchemaProp]);


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
                <Input size="small" status={error ? 'error' : ''} value={name} onChange={(e) => setName(e.target.value)} style={{ width: 92, flex: 1 }} placeholder="请输入插槽名称" />
                {error && <div className={styles.error}>{error}</div>}
                <Button variant="text" color="primary" className={styles.textBtn} onClick={() => handleAddConfirm(name)}>
                  <span>确定</span>
                </Button>
                <Button variant="text" color="primary" className={styles.textBtn} onClick={() => schemaSlots.length > 0 ? setAdding(false) : setVisible(false)}>
                  <span>取消</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => setAdding(true)} variant="text" color="primary" className={styles.textBtn}>
                <IconAdd />
                <span>自定义插槽</span>
              </Button>
            )
          }
        </div>
      </div>
    )
  }, [
    adding,
    setAdding,
    schemaSlots,
    handleAddConfirm,
    name,
    setName,
    error,
  ]);


  return (
    <Dropdown open={visible} onOpenChange={handleOpenChange} trigger={['click']} menu={menuProps} dropdownRender={renderDropdownMenu}>
      <Button block color="primary" variant="outlined">
        <IconAdd />
        <span>添加插槽</span>
      </Button>
    </Dropdown>
  )
}

export const SlotsEditorView = () => {
  const { component, updateComponent, modal } = useComponentContext();
  const [slots, setSlots] = useState<SlotDeclaration[]>([]);

  const getSlotOptionActions = useSlotActionHook();

  useEffect(() => {
    setSlots(component?.slots || []);
  }, [component?.slots]);

  const handleRemoveSlot = useCallback((name: string) => {
    if (!component?.name) {
      return;
    }

    modal.confirm({
      title: `确定删除插槽 ”${name}“ 吗？`,
      onOk: async () => {
        await updateComponent(getSlotOptionActions({
          type: 'remove',
          module: 'slot',
          name: component.name,
          propName: name,
        }));
      },
    });
  }, [component?.name, updateComponent, modal, getSlotOptionActions]);

  const handleMoveProp = useCallback(async (sourceItem: { group: string, name: string }, target: { group: string, name?: string }) => {
    if (!component || !component.name) {
      return;
    }

    const items = [...slots];
    const sourceIndex = items.findIndex((slot) => slot.name === sourceItem.name);
    const targetIndex = items.findIndex((slot) => slot.name === target.name);

    if (sourceIndex === targetIndex || sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    const temp = items[sourceIndex];
    items[sourceIndex] = items[targetIndex];
    items[targetIndex] = temp;

    setSlots(items);

    await updateComponent({
      type: 'order',
      module: 'slot',
      name: component?.name || '',
      data: {
        names: [
          ...(component.props || []).map((p) => p.name),
          ...(component.events || []).map((e) => normalizeEventName(e.name)),
          ...items.map((slot) => normalizeSlotName(slot.name)),
        ],
        isOptions: true,
      },
    });
  }, [component, updateComponent, slots]);


  return (
    <div>
      {
        slots.map((slot) => (
          <ComponentField key={slot.name} name={slot.name}  onRemove={handleRemoveSlot} onMove={handleMoveProp}>
            <SlotForm slotData={slot} />
          </ComponentField>
        ))
      }
      <AddSlot sourceName={component?.sourceName} />
    </div>
  );
};
