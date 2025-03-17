import { FC, HTMLAttributes, useContext, useState } from 'react';
import { Button, Divider } from 'antd';
import styles from './index.module.less';
import {
  IconSend,
  IconFeedback,
  IconHelp,
  PublishModal,
  FeedbackDialog,
} from '../../components';
import { ProjectContext } from '../../hooks/useProjectContext';

export const Header: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const { schema, openHelpModal } = useContext(ProjectContext);
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
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
          {
            schema && (
              <div className={styles.source}>
                <div className={styles.sourceTitle}>来源：npm</div>
                <div className={styles.sourcePkg}>包名：{schema.name}@{schema.version} </div>
              </div>
            )
          }
        </div>
        <div className={styles.actions}>
          <Button type="primary" className={styles.btn} onClick={() => setFeedbackOpen(true)}>
            <IconFeedback color="#7A8599" />
            吐槽
          </Button>
          <Divider type="vertical" className={styles.divider} />
          <Button type="primary" className={styles.btn} onClick={() => openHelpModal()}>
            <IconHelp color="#7A8599" />
            帮助文档
          </Button>
          <Button type="primary" onClick={() => setOpen(true)}>
            <IconSend />
            发布到资产中心
          </Button>
        </div>
      </div>
      <PublishModal open={open} onClose={() => setOpen(false)} />
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
};

export default Header;
