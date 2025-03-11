import { Button, Collapse } from 'antd';
import { useComponentContext } from '../../hooks';
import { useMemo } from 'react';
import styles from './index.module.less';
import { IconAdd } from '../../components';
import { Empty } from '../../components/Empty';
// import { ComponentField } from '../../components';

export const groups = [
  '数据属性',
  '主要属性',
  '交互属性',
  '状态属性',
  '样式属性',
  '工具属性',
];

const IconArrowRight = ({ isActive }: { isActive?: boolean }) => {
  return (
    <svg width="4" height="8" style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease-in-out' }} viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4.00021L-2.79753e-07 0.800202L0 7.2002L4 4.00021Z" fill="#86909C"/>
    </svg>
  )
}

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
            },
          },
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
          <Collapse
            size="small"
            expandIcon={({ isActive }) => <IconArrowRight isActive={isActive} />}
            className={styles.propGroup}
            items={items}
            defaultActiveKey={groups[1]}
          />
        ))
      }
    </>
  );
}
