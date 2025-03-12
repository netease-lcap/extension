import { Form, Input } from 'antd';
import { PropDeclaration } from '@nasl/types/nasl.ui.ast';
import { useEffect } from 'react';

export interface PropFormProps {
  propData: PropDeclaration;
}

export const PropForm = ({ propData }: PropFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(propData);
  }, [form, propData]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="title" label="标题">
        <Input />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input />
      </Form.Item>
      <Form.Item name="tsType" label="类型">
        <Input />
      </Form.Item>
    </Form>
  );
}
