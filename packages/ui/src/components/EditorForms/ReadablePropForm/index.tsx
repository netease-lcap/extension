import { useCallback, useEffect, useMemo } from 'react';
import { Form, Input } from 'antd';
import { PropDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext } from '../../../hooks';
import { NTypeSetter } from '../../NTypeSetter';
import { useTypeAST } from '../hooks';
import { NType } from '../../../types';
import { transformNType } from '../../../utils/transform';

export interface ReadablePropFormProps {
  propData: PropDeclaration;
}

export const ReadablePropForm = ({ propData }: ReadablePropFormProps) => {
  const [form] = Form.useForm();
  const { updateComponent, component } = useComponentContext();

  useEffect(() => {
    form.setFieldsValue(propData);
  }, [form, propData]);

  const handleRequestChange = useCallback((name: keyof PropDeclaration, value: any) => {
    if (!component?.name || propData[name] === value) {
      return;
    }

    updateComponent({
      type: 'update',
      module: 'readableProp',
      name: component.name,
      propName: propData.name,
      data: {
        [name]: value,
      },
    });
  }, [propData, component?.name, updateComponent]);

  const handleMap: Record<keyof PropDeclaration, () => void> = useMemo(() => {
    return [
      'title',
      'description',
      'tsType',
    ].reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          handleRequestChange(key as keyof PropDeclaration, form.getFieldValue(key));
        },
      }
    }, {} as Record<keyof PropDeclaration, () => void>);
  }, [form, handleRequestChange]);

  const [typeAST, handleChangeType] = useTypeAST(
    component?.typeMap.readableProp[propData.name],
    useCallback((type: NType) => {
      handleRequestChange('tsType', transformNType(type));
    }, [handleRequestChange]),
  );

  return (
    <Form form={form} layout="vertical" colon={false}>
      <Form.Item name="title" label="标题">
        <Input onBlur={handleMap.title} />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input onBlur={handleMap.description} />
      </Form.Item>
      <Form.Item name="tsType" label="类型">
        <NTypeSetter type={typeAST} onChange={handleChangeType} />
      </Form.Item>
    </Form>
  );
}
