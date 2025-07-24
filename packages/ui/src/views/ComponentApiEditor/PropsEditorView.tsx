import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Button, Collapse, Divider, Dropdown, Input } from 'antd';
import { useComponentContext } from '../../hooks';
import { useDrop } from 'react-dnd';
import styles from './index.module.less';
import { ComponentField, IconAdd, PropForm } from '../../components';
import { Empty } from '../../components/Empty';
import { useProjectContext } from '../../hooks/useProjectContext';
import { isCamelCase } from '../../utils/check';
import { APIUpdateOptions } from '../../types/component';
// import { ComponentField } from '../../components';

export const groups = [
  '数据属性',
  '主要属性',
  '交互属性',
  '工具属性',
  '状态属性',
  '样式属性',
  '高级属性',
];

const IconArrowRight = ({ isActive }: { isActive?: boolean }) => {
  return (
    <svg
      width="4"
      height="8"
      style={{
        transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 150ms ease-in-out',
      }}
      viewBox="0 0 4 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4.00021L-2.79753e-07 0.800202L0 7.2002L4 4.00021Z"
        fill="#86909C"
      />
    </svg>
  );
};

const AddProp = ({
  group,
  sourceName,
  onAdd = () => {},
}: {
  group: string;
  sourceName?: string;
  onAdd?: (name: string) => void;
}) => {
  const { getComponentSchema } = useProjectContext();
  const { component, updateComponent } = useComponentContext();
  const [adding, setAdding] = useState(false);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const schemaAttrs = useMemo(() => {
    if (!sourceName) {
      return [];
    }

    const schema = getComponentSchema(sourceName);
    if (!schema) {
      return [];
    }

    return schema.attrs || [];
  }, [sourceName, getComponentSchema]);

  const handleAddConfirm = useCallback(
    async (name: string) => {
      if (!component?.name) {
        return;
      }

      if (!isCamelCase(name)) {
        setError('请输入小驼峰的属性名称，例如：myName');
        return;
      }

      if (component?.props.some((prop: any) => prop.name === name)) {
        setError('该属性名称已存在');
        return;
      }

      setError('');

      await updateComponent({
        type: 'add',
        module: 'prop',
        name: component.name,
        data: {
          name,
          group,
        },
      });

      setVisible(false);
      onAdd(name);
    },
    [component?.props, component?.name, updateComponent, onAdd],
  );

  const handleAddSchemaProp = useCallback(
    async (propSchema: any) => {
      if (!component?.name) {
        return;
      }

      await updateComponent({
        type: 'add',
        module: 'prop',
        name: component.name,
        data: {
          name: propSchema.name,
          group,
          schema: propSchema,
        },
      });

      onAdd(propSchema.name);
    },
    [component?.name, updateComponent, group, onAdd],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setAdding(schemaAttrs.length > 0 ? false : true);
      setName('');
      setError('');
    }

    setVisible(open);
  }, []);

  const menuProps = useMemo(() => {
    const items = schemaAttrs.map((item: any) => ({
      key: item.name,
      label: item.name,
      disabled: component?.props.some((prop: any) => prop.name === item.name),
      onClick: () => handleAddSchemaProp(item),
    }));

    return {
      items,
    };
  }, [schemaAttrs, component?.props, handleAddSchemaProp]);

  const renderDropdownMenu = useCallback(
    (menu: React.ReactNode) => {
      return (
        <div className={styles.toggleMenu}>
          <div className={styles.menus}>{menu}</div>
          <Divider style={{ margin: 0 }} />
          <div className={styles.footer}>
            {adding ? (
              <>
                <Input
                  size="small"
                  status={error ? 'error' : ''}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: 92, flex: 1 }}
                  placeholder="请输入属性名称"
                />
                {error && <div className={styles.error}>{error}</div>}
                <Button
                  variant="text"
                  color="primary"
                  className={styles.textBtn}
                  onClick={() => handleAddConfirm(name)}>
                  <span>确定</span>
                </Button>
                <Button
                  variant="text"
                  color="primary"
                  className={styles.textBtn}
                  onClick={() =>
                    schemaAttrs.length > 0
                      ? setAdding(false)
                      : setVisible(false)
                  }>
                  <span>取消</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setAdding(true)}
                variant="text"
                color="primary"
                className={styles.textBtn}>
                <IconAdd />
                <span>添加{group}</span>
              </Button>
            )}
          </div>
        </div>
      );
    },
    [
      group,
      adding,
      setAdding,
      handleAddConfirm,
      schemaAttrs,
      name,
      setName,
      error,
    ],
  );

  return (
    <Dropdown
      open={visible}
      onOpenChange={handleOpenChange}
      trigger={['click']}
      menu={menuProps}
      dropdownRender={renderDropdownMenu}>
      <Button variant="text" className={styles.addBtn} color="primary">
        <IconAdd />
        <span>添加{group}</span>
      </Button>
    </Dropdown>
  );
};

const stop = (e: any) => e.stopPropagation();

interface PropGroupProps {
  group: string;
  onRemove: (name: string) => void;
  onMove?: (
    source: { name: string; group: string },
    target: { name?: string; group: string },
  ) => void;
  defaultOpenName?: string;
  items?: any[];
  onAdd?: (name: string) => void;
}

const PropGroup = ({
  group,
  onRemove = () => {},
  onMove = () => {},
  defaultOpenName = '',
  items: props = [],
  onAdd = () => {},
}: PropGroupProps) => {
  const { component } = useComponentContext();
  const [activeKeys, setActiveKeys] = useState<string[]>([groups[1]]);
  const ref = useRef<any>(null);

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    hover() {
      if (activeKeys.includes(group)) {
        return;
      }

      setActiveKeys([group]);
    },
    drop(item: any) {
      onMove({ name: item.name, group: item.group }, { group });
      item.group = group;
    },
  });

  drop(ref);

  const collapseItems = useMemo(() => {
    return [
      {
        key: group,
        label: `${group}（${props.length}）`,
        children:
          props.length > 0 ? (
            props.map((prop) => (
              <ComponentField
                key={prop.name}
                defaultOpen={defaultOpenName === prop.name}
                group={group}
                name={prop.name}
                title={prop.title}
                onRemove={onRemove}
                onMove={onMove}>
                <PropForm propData={prop} />
              </ComponentField>
            ))
          ) : (
            <Empty text="请点击右上方按钮添加属性" />
          ),
        styles: {
          header: {
            backgroundColor: 'rgba(247, 248, 250, 1)',
            color: 'rgba(29, 33, 41, 1)',
            fontSize: 12,
            fontWeight: 500,
            padding: '6px 8px',
          },
          body: {
            padding: 16,
            backgroundColor: isOver ? 'rgba(245, 245, 245, 1)' : 'transparent',
          },
        },
        extra: (
          <div onClick={stop}>
            <AddProp
              sourceName={component?.sourceName}
              group={group}
              onAdd={onAdd}
            />
          </div>
        ),
      },
    ];
  }, [
    props,
    component?.sourceName,
    onRemove,
    onMove,
    group,
    isOver,
    defaultOpenName,
    onAdd,
  ]);

  return (
    <Collapse
      size="small"
      ref={ref}
      expandIcon={({ isActive }) => <IconArrowRight isActive={isActive} />}
      className={styles.propGroup}
      items={collapseItems}
      activeKey={activeKeys}
      onChange={setActiveKeys}
      data-handler-id={handlerId}
    />
  );
};

export const PropsEditorView = () => {
  const { component, updateComponent, modal } = useComponentContext();
  const [groupPropMap, setGroupPropMap] = useState<Record<string, any[]>>({});
  const [defaultOpenName, setDefaultOpenName] = useState<string>('');

  const handleRemoveProp = useCallback(
    (name: string) => {
      if (!component?.name) {
        return;
      }

      modal.confirm({
        title: `确定删除属性 ”${name}“ 吗？`,
        centered: true,
        onOk: async () => {
          await updateComponent({
            type: 'remove',
            module: 'prop',
            name: component.name,
            propName: name,
          });
        },
      });
    },
    [component?.name, updateComponent, modal],
  );

  const handleMoveProp = useCallback(
    async (
      sourceItem: { group: string; name: string },
      target: { group: string; name?: string },
    ) => {
      if (
        sourceItem.name === target.name ||
        (sourceItem.group === target.group && !target.name)
      ) {
        return;
      }

      const map: Record<string, any[]> = {
        ...groupPropMap,
      };

      if (sourceItem.group === target.group) {
        const items = [...groupPropMap[sourceItem.group]];
        const sourceIndex = items.findIndex(
          (prop: any) => prop.name === sourceItem.name,
        );
        const targetIndex = items.findIndex(
          (prop: any) => prop.name === target.name,
        );

        if (sourceIndex === targetIndex) {
          return;
        }

        const temp = items[sourceIndex];
        items[sourceIndex] = items[targetIndex];
        items[targetIndex] = temp;

        map[sourceItem.group] = items;
        setGroupPropMap(map);
      } else {
        const sourceGroupItems = [...groupPropMap[sourceItem.group]];
        const targetGroupItems = [...groupPropMap[target.group]];

        const sourceItemIndex = sourceGroupItems.findIndex(
          (prop: any) => prop.name === sourceItem.name,
        );
        const targetItemIndex = target.name
          ? targetGroupItems.findIndex((prop: any) => prop.name === target.name)
          : targetGroupItems.length;
        if (sourceItemIndex === -1 || targetItemIndex === -1) {
          return;
        }

        sourceGroupItems.splice(sourceItemIndex, 1);
        targetGroupItems.splice(targetItemIndex, 0, sourceItem);
        map[sourceItem.group] = sourceGroupItems;
        map[target.group] = targetGroupItems;
      }

      const actions: APIUpdateOptions[] = [
        {
          type: 'order',
          module: 'prop',
          name: component?.name || '',
          data: {
            isOptions: true,
            names: ([] as string[]).concat(
              groups
                .map((group) =>
                  (map[group] || []).map((prop: any) => prop.name),
                )
                .flat(),
            ),
          },
        },
      ];

      if (sourceItem.group !== target.group) {
        actions.unshift({
          type: 'update',
          module: 'prop',
          name: component?.name || '',
          propName: sourceItem.name,
          data: {
            group: target.group,
          },
        });
      }

      await updateComponent(actions);
    },
    [component?.name, updateComponent, groupPropMap],
  );

  useEffect(() => {
    const map: Record<string, any[]> = {};
    groups.forEach((group) => {
      map[group] =
        component?.props.filter(
          (prop) => (prop.group || '主要属性') === group,
        ) || [];
    });

    setGroupPropMap(map);
  }, [component?.props]);
  return (
    <>
      {groups.map((group) => (
        <PropGroup
          key={group}
          group={group}
          defaultOpenName={defaultOpenName}
          items={groupPropMap[group]}
          onRemove={handleRemoveProp}
          onMove={handleMoveProp}
          onAdd={setDefaultOpenName}
        />
      ))}
    </>
  );
};
