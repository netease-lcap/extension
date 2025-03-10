import { Button, Collapse } from 'antd';
import { useComponentContext } from '../../hooks';
import { useMemo } from 'react';
import styles from './index.module.less';
import { IconAdd } from '../../components';

export const groups = [
  '数据属性',
  '主要属性',
  '交互属性',
  '状态属性',
  '样式属性',
  '工具属性',
];

export const PropsForm = () => {
  const { component } = useComponentContext();

  const groupItems = useMemo(() => {
    const compProps = component && component.props ? component.props : [];
    return groups.map((label) => {
      const props = compProps.filter((comp) => {
        const compGroup = comp.group || '主要属性';
        return compGroup === label;
      });

      return [
        {
          key: label,
          label: `${label}（${props.length}）`,
          children: (
            <div></div>
          ),
          extra: (
            <Button variant="text" className={styles.addBtn} color="primary">
              <IconAdd />
              <span>添加{label}</span>
            </Button>
          ),
        },
      ];
    });
  }, [component])

  return (
    <>
      {
        groupItems.map((items) => (
          <Collapse size="small" className={styles.propGroup} items={items} defaultActiveKey={groups[1]} />
        ))
      }
    </>
  );
}
