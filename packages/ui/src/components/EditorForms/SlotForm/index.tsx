import { useCallback, useEffect, useMemo } from 'react';
import { Form, Input } from 'antd';
import { SlotDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext } from '../../../hooks';
export interface SlotFormProps {
  slotData: SlotDeclaration;
}

export const SlotForm = ({ slotData }: SlotFormProps) => {
  const [form] = Form.useForm();
  const { updateComponent, component } = useComponentContext();

  useEffect(() => {
    form.setFieldsValue(slotData);
  }, [form, slotData]);

  const handleRequestChange = useCallback((name: keyof SlotDeclaration, value: any) => {
    if (!component?.name || slotData[name] === value) {
      return;
    }

    updateComponent({
      type: 'update',
      module: 'slot',
      name: component.name,
      propName: slotData.name,
      data: {
        [name]: value,
      },
    });
  }, [slotData, component?.name, updateComponent]);

  const handleMap: Record<keyof SlotDeclaration, () => void> = useMemo(() => {
    return [
      'title',
      'description',
      'tsType',
    ].reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          handleRequestChange(key as keyof SlotDeclaration, form.getFieldValue(key));
        },
      }
    }, {} as Record<keyof SlotDeclaration, () => void>);
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
