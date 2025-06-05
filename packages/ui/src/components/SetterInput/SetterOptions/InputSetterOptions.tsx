import { useCallback } from 'react';
import { Input, Form } from 'antd';
import type { InputSetter } from '@nasl/types/nasl.ui.ast';
import styles from './index.module.less';

export interface InputSetterOptionsProps {
  setter: InputSetter;
  onChangeOptions: (name: string, value: string | undefined) => void;
}

export const InputSetterOptions = (props: InputSetterOptionsProps) => {
  const { setter, onChangeOptions } = props;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeOptions('placeholder', e.target.value || undefined);
  }, [onChangeOptions]);

  return (
    <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="占位文本">
        <Input
            value={setter.placeholder}
            onChange={handleChange}
            className={styles.input}
            placeholder="请输入占位文本"
          />
      </Form.Item>
    </Form>
  );
};
