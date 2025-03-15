import { useCallback, useEffect, useMemo } from 'react';
import { Form, Input, Switch } from 'antd';
import { PropDeclaration } from '@nasl/types/nasl.ui.ast';
import { NTypeSetter } from '../../NTypeSetter';
import { SetterInput } from '../../SetterInput';
import { useComponentContext } from '../../../hooks';
import styles from './index.module.less';
import { NType } from '../../../types';
import { transformNType, transformDefaultValue } from '../../../utils/transform';
import { useTypeAST } from '../hooks';

export interface PropFormProps {
  propData: PropDeclaration;
}

export const PropForm = ({ propData }: PropFormProps) => {
  const [form] = Form.useForm();
  const { updateComponent, component } = useComponentContext();

  useEffect(() => {
    form.setFieldsValue({
      ...propData,
      defaultValue: transformDefaultValue(propData.defaultValue),
    });
  }, [form, propData]);

  const handleRequestChange = useCallback((name: keyof PropDeclaration, value: any) => {
    if (!component?.name) {
      return;
    }

    if (value === (name === 'defaultValue' ? transformDefaultValue(propData.defaultValue) : propData[name])) {
      return;
    }

    if (name === 'setter') {
      value = JSON.stringify(value);
      // TODO set tstype
    }

    updateComponent({
      type: 'update',
      module: 'prop',
      name: component.name,
      propName: propData.name,
      data: {
        [name]: value,
      },
    });
  }, [propData, component?.name, updateComponent]);

  const [typeAST, handleChangeType] = useTypeAST(
    component?.typeMap.prop[propData.name],
    useCallback((type: NType) => {
      handleRequestChange('tsType', transformNType(type));
    }, [handleRequestChange]),
  );

  const handleMap: Record<keyof PropDeclaration, () => void> = useMemo(() => {
    return [
      'title',
      'description',
      'sync',
      'settable',
      'bindHide',
      'bindOpen',
      'defaultValue',
      'setter',
    ].reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          handleRequestChange(key as keyof PropDeclaration, form.getFieldValue(key));
        },
      }
    }, {} as Record<keyof PropDeclaration, () => void>);
  }, [form, handleRequestChange]);

  return (
    <Form form={form} layout="vertical" colon={false}>
      <Form.Item name="title" label="标题">
        <Input onBlur={handleMap.title} />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input onBlur={handleMap.description} />
      </Form.Item>
      <Form.Item label="类型">
        <NTypeSetter type={typeAST} onChange={handleChangeType} />
      </Form.Item>
      <Form.Item name="defaultValue" label="默认值">
        <Input
          addonBefore={<span> const {propData.name} = </span>}
          placeholder="请输入默认值, 例如: '123' true false null 3"
          onBlur={handleMap.defaultValue}
        />
      </Form.Item>
      <Form.Item name="setter" label="设置器">
        <SetterInput value={propData.setter} onChange={handleMap.setter} />
      </Form.Item>
      <Form.Item name="sync" className={styles.horizontalItem} layout="horizontal" label="是否支持双向绑定">
        <Switch onChange={handleMap.sync} />
      </Form.Item>
      <Form.Item name="settable" className={styles.horizontalItem} layout="horizontal" label="允许该组件在逻辑中设置">
        <Switch onChange={handleMap.settable} />
      </Form.Item>
      <Form.Item name="bindHide" className={styles.horizontalItem} layout="horizontal" label="禁用绑定变量">
        <Switch onChange={handleMap.bindHide} />
      </Form.Item>
      <Form.Item name="bindOpen" className={styles.horizontalItem} layout="horizontal" label="仅允许绑定变量">
        <Switch onChange={handleMap.bindOpen} />
      </Form.Item>
      {/* 属性设置器 */}
      {/* 联动设置器 */}
    </Form>
  );
}
