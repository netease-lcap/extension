import { FC, HTMLAttributes } from 'react';
import Header from './Header';
import styles from './index.module.less';

export interface AppLayoutProps extends HTMLAttributes<HTMLDivElement> {
  hiddenHeader?: boolean;
}

export const AppLayout: FC<AppLayoutProps> = ({ children, hiddenHeader = false, className = '', ...rest }) => {
  return (
    <div className={[styles.app, hiddenHeader && styles.hiddenHeader, className].join(' ')} {...rest}>
      {!hiddenHeader && <Header />}
      <div className={[styles.content, hiddenHeader && styles.hiddenHeader].join(' ')}>
        {children}
      </div>
    </div>
  );
};
