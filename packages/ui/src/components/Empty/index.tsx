import styles from './index.module.less';

export const Empty = ({ text = '暂无数据' }: { text?: string }) => {
  return (
    <div className={styles.empty}>
      <span className={styles.text}>{text}</span>
    </div>
  )
}
