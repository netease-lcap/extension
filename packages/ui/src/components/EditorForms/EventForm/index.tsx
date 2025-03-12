import { useCallback, useEffect, useMemo } from 'react';
import { Form, Input } from 'antd';
import { EventDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext } from '../../../hooks';
export interface EventFormProps {
  eventData: EventDeclaration;
}

export const EventForm = ({ eventData }: EventFormProps) => {
  const [form] = Form.useForm();
  const { updateComponent, component } = useComponentContext();

  useEffect(() => {
    form.setFieldsValue(eventData);
  }, [form, eventData]);

  const handleRequestChange = useCallback((name: keyof EventDeclaration, value: any) => {
    if (!component?.name || eventData[name] === value) {
      return;
    }

    updateComponent({
      type: 'update',
      module: 'event',
      name: component.name,
      propName: eventData.name,
      data: {
        [name]: value,
      },
    });
  }, [eventData, component?.name, updateComponent]);

  const handleMap: Record<keyof EventDeclaration, () => void> = useMemo(() => {
    return [
      'title',
      'description',
      'tsType',
    ].reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          handleRequestChange(key as keyof EventDeclaration, form.getFieldValue(key));
        },
      }
    }, {} as Record<keyof EventDeclaration, () => void>);
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
