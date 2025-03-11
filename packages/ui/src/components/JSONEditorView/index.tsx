import { HTMLAttributes, useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import JSON from 'json5';
import { isNil } from 'lodash';

export interface JSONEditorViewProps extends HTMLAttributes<HTMLDivElement> {
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: (e: any) => void;
}

const stringify = (value: any) => !isNil(value) ? JSON.stringify(value, null, '  ') : '';

export const JSONEditorView = ({ value, onChange = () => {}, onBlur = () => {}, ...rest }: JSONEditorViewProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView>(null);
  const onChangeRef = useRef<(v: any) => void>(null);

  useEffect(() => {
    onChangeRef.current = (str) => {
      try {
        const obj = str ? JSON.parse(str) : {};
        if (stringify(obj) !== stringify(value)) {
          onChange(obj);
        }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: any) {
        return;
      }
    };
  }, [value, onChange]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const extensions = [
      basicSetup,
      json(),
      EditorView.domEventHandlers({
        blur: (e, v) => {
          onChangeRef.current?.(v.state.doc.toString());
          onBlur?.(e);
        }
      }),
    ];

    if (editorViewRef.current) {
      const str = editorViewRef.current.state.doc.toString();
      try {
        const obj = str ? JSON.parse(str) : {};
        if (stringify(obj) !== stringify(value)) {
          editorViewRef.current.setState(EditorState.create({
            doc: stringify(value),
            extensions,
          }));
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: any) { /* empty */ }
      return;
    }

    editorViewRef.current = new EditorView({
      doc: stringify(value),
      parent: editorRef.current,
      extensions,
    });
  }, [value]);

  return <div {...rest} ref={editorRef} />;
};
