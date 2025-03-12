import { useCallback, useEffect, useMemo } from 'react';
import { Form, Input } from 'antd';
import { LogicDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext } from '../../../hooks';
export interface MethodFormProps {
  methodData: LogicDeclaration;
}

export const MethodForm = ({ methodData }: MethodFormProps) => {
  const [form] = Form.useForm();
  const { updateComponent, component } = useComponentContext();

  useEffect(() => {
    form.setFieldsValue(methodData);
  }, [form, methodData]);

  const handleRequestChange = useCallback((name: keyof LogicDeclaration, value: any) => {
    if (!component?.name || methodData[name] === value) {
      return;
    }

    updateComponent({
      type: 'update',
      module: 'method',
      name: component.name,
      propName: methodData.name,
      data: {
        [name]: value,
      },
    });
  }, [methodData, component?.name, updateComponent]);

  const handleMap: Record<string, () => void> = useMemo(() => {
    return [
      'title',
      'description',
      'tsType',
    ].reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          handleRequestChange(key as keyof LogicDeclaration, form.getFieldValue(key));
        },
      }
    }, {} as Record<keyof LogicDeclaration, () => void>);
  }, [form, handleRequestChange]);

  return (
    <Form form={form} layout="vertical" colon={false}>
      <Form.Item name="title" label="标题">
        <Input onBlur={handleMap.title} />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input onBlur={handleMap.description} />
      </Form.Item>
      <Form.Item name="tsType" label="类型">
        <Input onBlur={handleMap.tsType} />
      </Form.Item>
    </Form>
  );
}
