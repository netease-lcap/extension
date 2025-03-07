import { FC, HTMLAttributes } from 'react';
import Header from './Header';
import styles from './index.module.less';

export const AppLayout: FC<HTMLAttributes<HTMLDivElement>> = ({ children, ...rest }) => {
  return (
    <div className={styles.app} {...rest}>
      <Header />
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
