import { useMemo, FC, CSSProperties, useCallback, useRef, useEffect, useState } from 'react';
import { Collapse, Button, Tooltip } from 'antd';
import { useDrop, useDrag, XYCoord } from 'react-dnd';
import type { Identifier } from 'dnd-core';
import classNames from 'classnames';
import styles from './index.module.less';
import { IconTrash, IconDragHandle, IconArrowDown } from '../icons';

export interface ComponentFieldProps {
  name: string;
  title?: string;
  onRemove?: (name: string) => void;
  style?: CSSProperties;
  className?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  group?: string;
  onMove?: (source: { name: string, group: string }, target: { name?: string, group: string }, position?: 'up' | 'down') => void;
}

interface DragItem {
  name: string;
  group: string;
}

export const ComponentField: FC<ComponentFieldProps> = (props) => {
  const {
    name,
    title,
    group = '',
    onRemove = () => {},
    onMove = () => {},
    children,
    className,
    style = {},
    defaultOpen = false,
    ...restProps
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onRemove(name);
    },
    [onRemove, name],
  );

  const [position, setPosition] = useState<'up' | 'down'>('up');

  const [{ handlerId, isOver }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null, isOver: boolean }
  >({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current || item.name === name) {
        return;
      }


      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      setPosition(hoverClientY >= hoverMiddleY ? 'down' : 'up');
    },
    drop(item: DragItem) {
      if (item.name === name) {
        return;
      }

      onMove({ name: item.name, group: item.group }, { name, group }, position);
      item.group = group;
    },
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'card',
    item: () => {
      return {
        name: name,
        group,
      };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  const items = useMemo(() => {
    const label = `${name}${title ? `（${title}）` : ''}`;

    return [
      {
        key: '1',
        styles: {
          header: {
            backgroundColor: 'transparent',
            color: 'rgba(29, 33, 41, 1)',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: '20px',
            padding: '4px 12px 4px 4px',
            alignItems: 'center',
            gap: 8,
          },
          body: {
            padding: 16,
            backgroundColor: 'transparent',
          },
        },
        label: (
          <div className={styles.label}>
            <span className={styles.drag} ref={dragHandleRef}>
              <IconDragHandle />
            </span>
            <Tooltip mouseEnterDelay={0.5} title={label}>
              <span className={styles.name}>{label}</span>
            </Tooltip>
            <Button
              type="text"
              className={styles.remove}
              onClick={handleRemove}>
              <IconTrash />
            </Button>
          </div>
        ),
        children,
      },
    ];
  }, [
    children,
    name,
    handleRemove,
    title,
  ]);

  const rootClassName = useMemo(() => {
    return classNames(styles.componentField, className, {
      [styles.isOver]: isOver,
      [styles.modeUp]: isOver && position === 'up',
      [styles.modeDown]: isOver && position === 'down',
    });
  }, [className, isOver, position]);

  useEffect(() => {
    drag(dragHandleRef.current);
    dragPreview(ref.current);
    drop(ref.current);
  }, [drag, dragPreview, drop, dragHandleRef, ref]);

  return (
    <div
      ref={ref}
      className={rootClassName}
      style={{ opacity, ...style }}
      {...restProps}
      data-handler-id={handlerId}
  >
      <Collapse
        ref={ref}
        expandIcon={({ isActive }) => <IconArrowDown isActive={isActive} />}
        expandIconPosition="end"
        defaultActiveKey={defaultOpen ? ['1'] : []}
        size="small"
        items={items as any[]}
        style={{ backgroundColor: 'transparent', overflow: 'hidden' }}
      />
    </div>
  );
};
