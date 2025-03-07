import { FC, HTMLAttributes } from 'react';
import { Button, Divider } from 'antd';
import styles from './index.module.less';
import { IconSend, IconFeedback, IconHelp } from '../../components/icons';

export const Header: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div {...props} className={styles.header}>
      <div className={styles.meta}>
        <div className={styles.titleInfo}>
          <div className={styles.title}>
            组件可视化接入
          </div>
          <Divider type="vertical" className={styles.divider} />
          <div className={styles.subTitle}>
            API配置
          </div>
        </div>
        <div className={styles.source}>
          <div className={styles.sourceTitle}>来源：npm</div>
          <div className={styles.sourcePkg}>包名：echarts@12.2.3</div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button type="primary" className={styles.btn}>
          <IconFeedback color="#7A8599" />
          吐槽
        </Button>
        <Divider type="vertical" className={styles.divider} />
        <Button type="primary" className={styles.btn}>
          <IconHelp color="#7A8599" />
          反馈
        </Button>
        <Button type="primary">
          <IconSend />
          发布到资产中心
        </Button>
      </div>
    </div>
  );
};

export default Header;
