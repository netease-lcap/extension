import { FC, HTMLAttributes, MouseEvent } from 'react';
import classNames from 'classnames';
import styles from './index.module.less';
import { IconAddCircle, IconRemove } from '../icons';

export interface ComponentListProps extends HTMLAttributes<HTMLDivElement> {
  componentList: ({ name: string, [key: string]: any })[];
  value?: string;
  selectable?: boolean;
  action?: 'remove' | 'add';
  onChange?: ((value: string) => void) | any;
  onRemove?: (name: string) => void;
  onAdd?: (name: string) => void;
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

  const handleAdd = (e: MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd(name);
  };

  return (
    <div className={rootClass} {...rest}>
      {
        componentList.map((component) => {
          return (
            <div key={component.name} onClick={() => handleClick(component.name)} className={classNames(styles.componentItem, { [styles.active]: selectable && value === component.name })}>
              <span className={styles.componentName}>{component.name}</span>
              <div className={styles.actions}>
                {
                  action === 'remove' && (
                    <span className={`${styles.action} ${styles.remove}`} onClick={(e) => handleRemove(e, component.name)}>
                      <IconRemove />
                    </span>
                  )
                }
                {
                  action === 'add' && (
                    <span className={`${styles.action} ${styles.add}`} onClick={(e) => handleAdd(e, component.name)}>
                      <IconAddCircle />
                    </span>
                  )
                }
              </div>
            </div>
          );
        })
      }
    </div>
  );
};
