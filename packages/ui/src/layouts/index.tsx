import { FC, HTMLAttributes } from 'react';
import Header from './Header';
import styles from './index.module.less';

export interface AppLayoutProps extends HTMLAttributes<HTMLDivElement> {
  hiddenHeader?: boolean;
}

export const AppLayout: FC<AppLayoutProps> = ({ children, hiddenHeader = false, ...rest }) => {
  return (
    <div className={styles.app} {...rest}>
      {!hiddenHeader && <Header />}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
