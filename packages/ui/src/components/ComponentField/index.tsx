import { useMemo, FC, CSSProperties } from 'react';
import { Collapse, Button } from 'antd';
import styles from './index.module.less';
import { IconTrash, IconDragHandle, IconArrowDown } from '../icons';

export interface ComponentFieldProps {
  name: string;
  onRemove?: (name: string) => void;
  style?: CSSProperties;
  className?: string;
  children?: React.ReactNode;
}
export const ComponentField: FC<ComponentFieldProps> = (props) => {
  const { name, onRemove = () => {}, children, ...restProps } = props;

  const items = useMemo(() => {
    return [
      {
        key: '1',
        styles: {
          header: {
            backgroundColor: '#fff',
            color: 'rgba(29, 33, 41, 1)',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: '20px',
            padding: '4px 12px 4px 4px',
            alignItems: 'center',
          },
          body: {
            padding: 16,
          },
        },
        label: (
          <div className={styles.label}>
            <span className={styles.drag}><IconDragHandle /></span>
            <span>{name}</span>
            <Button type="text" className={styles.remove} onClick={() => onRemove(name)}>
              <IconTrash />
            </Button>
          </div>
        ),
        children,
      },
    ];
  }, [children, name, onRemove]);

  return (
    <Collapse {...restProps} expandIcon={({ isActive }) => <IconArrowDown isActive={isActive} />} expandIconPosition="end" size="small" items={items} />
  );
}
