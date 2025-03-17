import { useCallback, useEffect, useMemo } from 'react';
import { Form, Input, Switch } from 'antd';
import { PropDeclaration } from '@nasl/types/nasl.ui.ast';
import { NTypeSetter } from '../../NTypeSetter';
import { SetterInput } from '../../SetterInput';
import { useComponentContext } from '../../../hooks';
import styles from './index.module.less';
import { NType, NUnionType, NUnknowType } from '../../../types';
import { transformNType, transformDefaultValue } from '../../../utils/transform';
import { getInputValueStringify } from '../../../utils/nasl';
import { useTypeAST } from '../hooks';

export interface PropFormProps {
  propData: PropDeclaration;
}

function getUnionType(vals: string[], type?: NType | undefined) {
  const uType = {
    type: 'union',
    value: vals.map((v) => ({
      type: 'unknow',
      raw: v,
    })),
  } as NUnionType;

  if (!type) {
    return uType;
  }

  if (type.type === 'union') {
    uType.value = [
      ...uType.value,
      ...(type as NUnionType).value.filter((n) => {
        if (n.type !== 'unknow') {
          return true;
        }

        return !uType.value.some((v) => {
          let v1, v2;
          try {
            v1 = eval((v as NUnknowType).raw);
            v2 = eval((n as NUnknowType).raw);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            return false;
          }

          return v1 === v2;
        });
      }),
    ];
  } else {
    uType.value = [...uType.value, type];
  }

  return uType;
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

  const requestChangeSetter = useCallback((value: any) => {
    if (!component?.name) {
      return;
    }

    let tsType = '';
    if (['EnumSelectSetter', 'CapsulesSetter'].includes(value.concept)) {
      const vals: string[] = [];
      value = {
        ...value,
        options: value.options.map((item: any) => {
          const a = { ...item };
          vals.push(a.value);
          delete a.value;
          return a;
        }),
      };

      if (vals.length > 0) {
        tsType = transformNType(getUnionType(vals, component?.typeMap.prop[propData.name]));
      }
    }

    value = JSON.stringify(value);
    if (tsType) {
      const data: any = {
        setter: value,
      };

      if (tsType) {
        data.tsType = tsType;
      }

      updateComponent({
        type: 'update',
        module: 'prop',
        name: component.name,
        propName: propData.name,
        data,
      });
      return;
    }
  }, [component?.name, propData.name, updateComponent, component?.typeMap.prop]);

  const handleRequestChange = useCallback((name: keyof PropDeclaration, value: any) => {
    if (!component?.name) {
      return;
    }

    if (value === (name === 'defaultValue' ? transformDefaultValue(propData.defaultValue) : propData[name])) {
      return;
    }

    if (name === 'setter') {
      return requestChangeSetter(value);
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
  }, [
    propData,
    component?.name,
    updateComponent,
    requestChangeSetter,
  ]);

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
          let val = form.getFieldValue(key);

          if (key === 'defaultValue') {
            val = getInputValueStringify(val);
          }

          handleRequestChange(key as keyof PropDeclaration, val);
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
        <SetterInput value={propData.setter} type={typeAST} onChange={handleMap.setter} />
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
