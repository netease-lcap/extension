
import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 引入样式文件
import typescript from 'highlight.js/lib/languages/typescript'; // 引入语言包
import { uid } from 'uid';
import { getAPIContent } from '../../services';
import styles from './index.module.less';

hljs.registerLanguage('typescript', typescript); // 注册语言包

export const APICodeView = ({ name }: { name: string }) => {
  const [code, setCode] = useState('');
  const preRef = useRef<HTMLPreElement>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const loadCode = async () => {
    if (!name) {
      return;
    }

    const code = await getAPIContent(name);
    setCode(code);
    setReviewId(uid());
  };

  useEffect(() => {
    loadCode();
  }, [name]);

  useEffect(() => {
    const pre = preRef.current;

    if (!pre || !code) {
      return;
    }

    hljs.highlightBlock(pre);
  }, [code]); // 确保在组件加载后高亮代码

    return (
      <pre ref={preRef} key={reviewId} className={styles.codeView}><code>{code}</code></pre>
    );
};

export default APICodeView;
