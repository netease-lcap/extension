import { FC, HTMLAttributes, MouseEvent, useCallback, useState } from 'react';
import { Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import styles from './index.module.less';
import { IconAddCircle, IconRemove } from '../icons';
import { Empty } from '../Empty';

export interface ComponentListProps extends HTMLAttributes<HTMLDivElement> {
  componentList: ({ name: string, [key: string]: any })[];
  value?: string;
  selectable?: boolean;
  action?: 'remove' | 'add';
  onChange?: ((value: string) => void) | any;
  onRemove?: (name: string) => void;
  onAdd?: (name: string) => void | Promise<void>;
}

export const ComponentList: FC<ComponentListProps> = (props: ComponentListProps) => {
  const {
    componentList,
    value,
    action = 'add',
    onChange = () => {},
    onRemove = () => {},
    onAdd = () => {},
    selectable = true,
    className,
    ...rest
  } = props;
  const [adding, setAdding] = useState(false);
  const rootClass = classNames(styles.componentList, className);

  const handleClick = (name: string) => {
    if (selectable) {
      onChange(name);
    }
  };

  const handleRemove = (e: MouseEvent,  name: string) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(name);
  };

  const handleAdd = useCallback(async (e: MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await onAdd(name);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  }, [onAdd]);

  const renderAddAction = useCallback((component: any) => {
    if (action !== 'add') {
      return null;
    }

    if (adding) {
      return (
        <span className={`${styles.action} ${styles.add}`}>
          <LoadingOutlined />
        </span>
      );
    }

    const actionElement = (
      <span className={`${styles.action} ${styles.add}`} onClick={component.disabled ? undefined : (e) => handleAdd(e, component.name)}>
        <IconAddCircle />
      </span>
    );

    if (component.disabled) {
      return (
        <Tooltip title="该组件已添加">
          {actionElement}
        </Tooltip>
      );
    }

    return actionElement;
  }, [action, handleAdd, adding]);

  return (
    <div className={rootClass} {...rest}>
      {
        componentList.length === 0 && (
          <Empty text="暂无组件" />
        )
      }
      {
        componentList.map((component) => {
          return (
            <div key={component.name} onClick={() => handleClick(component.name)} className={classNames(styles.componentItem, { [styles.active]: selectable && value === component.name, [styles.disabled]: component.disabled })}>
              <span className={styles.componentName}>{component.name}</span>
              <div className={styles.actions}>
                {
                  action === 'remove' && (
                    <span className={`${styles.action} ${styles.remove}`} onClick={(e) => handleRemove(e, component.name)}>
                      <IconRemove />
                    </span>
                  )
                }
                {renderAddAction(component)}
              </div>
            </div>
          );
        })
      }
    </div>
  );
};
