import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Input, Divider, Dropdown } from 'antd';
import type { EventDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext, useProjectContext } from '../../hooks';
import { ComponentField, IconAdd, EventForm } from '../../components';
import { isCamelCase } from '../../utils/check';
import { normalizeEventName } from '../../utils/nasl';
import styles from './index.module.less';

export const AddEvent = ({ sourceName }: { sourceName?: string }) => {
  const { getComponentSchema } = useProjectContext();
  const { component, updateComponent } = useComponentContext();
  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const schemaEvents = useMemo(() => {
    if (!sourceName) {
      return [];
    }

    const schema = getComponentSchema(sourceName);
    if (!schema) {
      return [];
    }

    return schema.events || [];
  }, [sourceName, getComponentSchema]);

  const handleAddConfirm = useCallback(async(name: string) => {
    if (!component?.name) {
      return;
    }

    if (!isCamelCase(name)) {
      setError('请输入小驼峰的事件名称，例如：myName');
      return;
    }

    if (component?.events.some((prop: any) => prop.name === name)) {
      setError('该事件名称已存在');
      return;
    }

    setError('');

    await updateComponent({
      type: 'add',
      module: 'event',
      name: component.name,
      data: {
        name,
      },
    });

    setVisible(false);
  }, [component?.events, component?.name, updateComponent]);

  const handleAddSchemaProp = useCallback(async (propSchema: any) => {
    if (!component?.name) {
      return;
    }

    await updateComponent({
      type: 'add',
      module: 'event',
      name: component.name,
      data: {
        name: propSchema.name,
        schema: propSchema,
      },
    });
  }, [component?.name, updateComponent]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setAdding(schemaEvents.length > 0 ? false : true);
      setName('');
      setError('');
    }

    setVisible(open);
  }, [schemaEvents]);

  const menuProps = useMemo(() => {
    const items = schemaEvents.map((item: any) => ({
      key: item.name,
      label: item.name,
      disabled: component?.events.some((prop: any) => prop.name === item.name),
      onClick: () => handleAddSchemaProp(item),
    }));

    return {
      items,
    };
  }, [schemaEvents, component?.events, handleAddSchemaProp]);


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
                <Input size="small" status={error ? 'error' : ''} value={name} onChange={(e) => setName(e.target.value)} style={{ width: 92, flex: 1 }} placeholder="请输入事件名称" />
                {error && <div className={styles.error}>{error}</div>}
                <Button variant="text" color="primary" className={styles.textBtn} onClick={() => handleAddConfirm(name)}>
                  <span>确定</span>
                </Button>
                <Button variant="text" color="primary" className={styles.textBtn} onClick={() => schemaEvents.length > 0 ? setAdding(false) : setVisible(false)}>
                  <span>取消</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => setAdding(true)} variant="text" color="primary" className={styles.textBtn}>
                <IconAdd />
                <span>自定义事件</span>
              </Button>
            )
          }
        </div>
      </div>
    )
  }, [
    adding,
    setAdding,
    schemaEvents,
    handleAddConfirm,
    name,
    setName,
    error,
  ]);


  return (
    <Dropdown open={visible} onOpenChange={handleOpenChange} trigger={['click']} menu={menuProps} dropdownRender={renderDropdownMenu}>
      <Button block color="primary" variant="outlined">
        <IconAdd />
        <span>添加事件</span>
      </Button>
    </Dropdown>
  )
}

export const EventsEditorView = () => {
  const { component, updateComponent, modal } = useComponentContext();
  const [events, setEvents] = useState<EventDeclaration[]>([]);

  useEffect(() => {
    setEvents(component?.events || []);
  }, [component?.events]);

  const handleRemoveEvent = useCallback((name: string) => {
    if (!component?.name) {
      return;
    }

    modal.confirm({
      title: `确定删除事件 ”${name}“ 吗？`,
      centered: true,
      onOk: async () => {
        await updateComponent({
          type: 'remove',
          module: 'event',
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

    const items = [...events];
    const sourceIndex = items.findIndex((event) => event.name === sourceItem.name);
    const srcItem = items[sourceIndex];

    items.splice(sourceIndex, 1);

    const targetIndex = items.findIndex((event) => event.name === target.name);

    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    if (position === 'up') {
      items.splice(targetIndex, 0, srcItem);
    } else {
      items.splice(targetIndex + 1, 0, srcItem);
    }

    setEvents(items);

    await updateComponent({
      type: 'order',
      module: 'event',
      name: component?.name || '',
      data: {
        names: [
          ...(component.props || []).map((p) => p.name),
          ...items.map((event) => normalizeEventName(event.name)),
        ],
        isOptions: true,
      },
    });
  }, [component, updateComponent, events]);


  return (
    <div>
      {
        events.map((event) => (
          <ComponentField key={event.name} name={event.name}  onRemove={handleRemoveEvent} onMove={handleMoveProp}>
            <EventForm eventData={event} />
          </ComponentField>
        ))
      }
      <AddEvent sourceName={component?.sourceName} />
    </div>
  );
};
