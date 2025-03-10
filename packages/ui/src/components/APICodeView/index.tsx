
import { useEffect, useRef, useState } from 'react';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { getAPIContent } from '../../services';
import { useHandleNaslChange } from '../../hooks';
import styles from './index.module.less';

export const APICodeView = ({ name }: { name: string }) => {
  const [code, setCode] = useState('');
  const preRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView>(null);

  const loadCode = async () => {
    if (!name) {
      return;
    }

    const code = await getAPIContent(name);
    setCode(code);
  };

  useEffect(() => {
    loadCode();
  }, [name]);

  useHandleNaslChange(loadCode);

  useEffect(() => {
    const pre = preRef.current;

    if (!pre || !code) {
      return;
    }

    const extensions = [
      basicSetup,
      javascript({ typescript: true }),
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      EditorView.contentAttributes.of({tabindex: '0'}),
    ];

    if (editorRef.current) {
      const state = EditorState.create({
        doc: code,
        extensions,
      });

      editorRef.current.setState(state);
      return;
    }

    editorRef.current = new EditorView({
      extensions,
      parent: pre,
      doc: code,
    });
  }, [code]); // 确保在组件加载后高亮代码

    return (
      <div ref={preRef} className={styles.codeView}></div>
    );
};

export default APICodeView;
