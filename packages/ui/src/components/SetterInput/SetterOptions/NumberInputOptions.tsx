import { useMemo } from 'react';
import { InputNumber, Form, Input } from 'antd';
import type { NumberInputSetter } from '@nasl/types/nasl.ui.ast';
import { isNil } from 'lodash';

export interface NumberInputOptionsProps {
  setter: NumberInputSetter;
  onChangeOptions: (name: keyof NumberInputSetter, value: any | undefined) => void;
}

export const NumberInputOptions = (props: NumberInputOptionsProps) => {
  const { setter, onChangeOptions } = props;

  const changeActions = useMemo(() => {
    return {
      min: (value: number | null | undefined) => onChangeOptions('min', isNil(value) ? undefined : value),
      max: (value: number | null | undefined) => onChangeOptions('max', isNil(value) ? undefined : value),
      precision: (value: number | null | undefined) => onChangeOptions('precision', isNil(value) ? undefined : value),
      placeholder: (e: React.ChangeEvent<HTMLInputElement>) => onChangeOptions('placeholder', e.target.value || undefined),
    };
  }, [onChangeOptions]);

  return (
    <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="最小值">
        <InputNumber
          value={setter.min}
          style={{ width: '100%' }}
          onChange={changeActions.min}
        />
      </Form.Item>
      <Form.Item label="最大值">
        <InputNumber
          value={setter.max}
          style={{ width: '100%' }}
          onChange={changeActions.max}
        />
      </Form.Item>
      <Form.Item label="精度">
        <InputNumber
          style={{ width: '100%' }}
          value={setter.precision}
          onChange={changeActions.precision}
        />
      </Form.Item>
      <Form.Item label="占位文本">
        <Input
          value={setter.placeholder}
          onChange={changeActions.placeholder}
        />
      </Form.Item>
    </Form>
  );
};
