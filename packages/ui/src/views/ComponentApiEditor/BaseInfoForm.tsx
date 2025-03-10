import { useEffect } from 'react';
import { Button, Form, Input, Radio } from 'antd';
import { JSONEditorView } from '../../components/JSONEditorView';
import { useComponentContext } from '../../hooks/useComponentContext';

export interface BaseInfoFormData {
  name?: string;
  title?: string;
  description?: string;
  type?: 'pc' | 'h5' | 'both';
  ideusage?: string;
}

export const BaseInfo = ({ removeSubComponent }: { removeSubComponent: (name: string) => void }) => {
  const [form] = Form.useForm();
  const { component } = useComponentContext();

  useEffect(() => {
    if (component) {
      form.setFieldsValue(component);
    }
  }, [component]);

  return (
   <Form layout="vertical" form={form}>
    <Form.Item label="组件名称" required name="name">
      <Input disabled />
    </Form.Item>
    <Form.Item label="组件标题" name="title">
      <Input />
    </Form.Item>
    <Form.Item label="组件描述" name="description">
      <Input />
    </Form.Item>
    {
      component && !component.isChild && (
        <Form.Item label="组件端" name="type">
          <Radio.Group>
            <Radio value="pc">PC</Radio>
            <Radio value="h5">H5</Radio>
            <Radio value="both">通用</Radio>
          </Radio.Group>
        </Form.Item>
      )
    }
    <Form.Item required label="页面设计器适配" name="ideusage">
      <JSONEditorView />
    </Form.Item>
    {
      component?.isChild && (
        <Button color="danger" block variant="outlined" onClick={() => removeSubComponent(component.name)}>删除子组件</Button>
      )
    }
   </Form>
  );
};

export default BaseInfo;
