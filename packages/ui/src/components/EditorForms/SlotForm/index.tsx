import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Flex } from 'antd';
import { SlotDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext } from '../../../hooks';
import { NType } from '../../../types';
import { transformNType } from '../../../utils/transform';
import { NTypeSetter } from '../../NTypeSetter';
import { IconTrash } from '../../icons';

export interface SlotFormProps {
  slotData: SlotDeclaration;
}

export const SlotForm = ({ slotData }: SlotFormProps) => {
  const [form] = Form.useForm();
  const { updateComponent, component } = useComponentContext();
  const type = component?.typeMap.slot[slotData.name];
  const [typeAST, setTypeAST] = useState<NType | null>(null);

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

  const handleChangeType = useCallback((t: NType | null) => {
    setTypeAST(t);
    handleRequestChange('tsType', t ? `(current: ${transformNType(t)}) => Array<nasl.ui.ViewComponent>` : '() => Array<nasl.ui.ViewComponent>');
  }, [handleRequestChange]);

  useEffect(() => {
    const ast = type;
    if (!ast) {
      setTypeAST(null);
      return;
    }

    if (JSON.stringify(ast) !== JSON.stringify(typeAST)) {
      setTypeAST(ast);
    }
  }, [type]);

  return (
    <Form form={form} layout="vertical" colon={false}>
      <Form.Item name="title" label="标题">
        <Input onBlur={handleMap.title} />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input onBlur={handleMap.description} />
      </Form.Item>
      <Form.Item label={typeAST ? '插槽参数类型' : null }>
        {
          typeAST ? (
            <Flex align="center" gap={8}>
              <NTypeSetter style={{ flex: 1 }} disabledType={(n) => n !== 'struct'} type={typeAST} onChange={handleChangeType} />
              <Button onClick={() => handleChangeType(null)}>
                <IconTrash />
              </Button>
            </Flex>
          ) : (
            <Button type="link" onClick={() => handleChangeType({ type: 'struct', value: [] })}>
              设置插槽参数类型
            </Button>
          )
        }
      </Form.Item>
    </Form>
  );
}
