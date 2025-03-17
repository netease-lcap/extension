import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import type { BaseSetter, EnumSelectSetter, CapsulesSetter, SetterOption } from '@nasl/types/nasl.ui.ast';
import { Input, Popconfirm, Button, Select, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import cloneDeep from 'lodash/cloneDeep';
import classNames from 'classnames';
import { SetterList } from './constants';
import {
  InputSetterOptions,
  NumberInputOptions,
  IconSetterOptions,
  SelectOptions,
} from './SetterOptions';
import { NType, NArrayType, NUnionType, NUnknowType } from '../../types';
import styles from './index.module.less';

export interface SetterInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: BaseSetter;
  type: NType;
  onChange: (value: BaseSetter) => void;
}

const OptionsMap = {
  InputSetter: InputSetterOptions,
  NumberInputSetter: NumberInputOptions,
  IconSetter: IconSetterOptions,
  EnumSelectSetter: SelectOptions,
  CapsulesSetter: SelectOptions,
};

function genNormalVal(v: string) {
  try {
    return eval(v);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
}

const getSetterOptions = (type: NType, multiple: boolean) => {
  let utype: NUnionType | undefined;

  if (type.type === 'array' && multiple && (type as NArrayType).value && (type as NArrayType).value.type === 'union' && ((type as NArrayType).value as NUnionType).value.length > 0) {
    utype = (type as NArrayType).value as NUnionType;
  } else if (type.type === 'union' && (type as NUnionType).value.length > 0 && !multiple) {
    utype = type as NUnionType;
  }

  if (!utype) {
    return [] as SetterOption[];
  }

  let end = utype.value.findIndex((n) => {
    if (n.type !== 'unknow') {
      return true;
    }

    const val = genNormalVal((n as NUnknowType).raw);
    return typeof val !== 'string' && typeof val !== 'number';
  });

  if (end === -1) {
    end = utype.value.length;
  }

  return utype.value.slice(0, end).map((n) => {
    const v = eval((n as NUnknowType).raw);
    return {
      title: String(v),
      value: JSON.stringify(v),
    } as SetterOption;
  });
}

export const SetterInput = (props: SetterInputProps) => {
  const {
    value,
    type,
    onChange,
    className = '',
    style = {},
    ...rest
  } = props;
  const [setter, setSetter] = useState<BaseSetter>({ concept: 'InputSetter' });

  useEffect(() => {
    const v = value || { concept: 'InputSetter' };
    if (JSON.stringify(setter) !== JSON.stringify(v)) {
      const setterOptions = cloneDeep(v);
      if (['EnumSelectSetter', 'CapsulesSetter'].includes(setterOptions.concept)) {
        (setterOptions as EnumSelectSetter | CapsulesSetter).options = (setterOptions as EnumSelectSetter | CapsulesSetter).options.map((op) => ({
          ...op,
          value: JSON.stringify(op.value),
        }));
      }

      setSetter(setterOptions);
    }
  }, [value]);

  const rootClassName = useMemo(() => {
    return classNames(styles.setterInput, className);
  }, [className]);

  const setterText = useMemo(() => {
    const concept = value?.concept || 'InputSetter';
    const setter = SetterList.find((item) => item.value === concept) || SetterList[0];

    return `${setter.label} (${concept})`;
  }, [value?.concept])

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setSetter(cloneDeep(value || { concept: 'InputSetter' }));
    }
  }, [value]);

  const handleConfirm = useCallback(() => {
    onChange(setter);
  }, [onChange, setter]);

  const handleChangeConcept = useCallback((v: any) => {
    const s = { concept: v };
    switch (v) {
      case 'EnumSelectSetter':
      case 'CapsulesSetter':
        (s as EnumSelectSetter | CapsulesSetter).options = getSetterOptions(type, false);
        break;
      default:
        break;
    }

    setSetter(s);
  }, [type]);

  const handleChangeOptions = useCallback((name: string, v: any) => {
    setSetter({
      ...setter,
      [name]: v,
    });
  }, [setter]);

  const OptionsComponent: any = OptionsMap[setter.concept as keyof typeof OptionsMap];

  const setterOptions = useMemo(() => {
    return SetterList.filter((item) => {
      return item.value !== 'CapsulesSetter' || setter.concept === 'CapsulesSetter';
    });
  }, [setter]);

  const setterContent = useMemo(() => (
    <div className={styles.setterPopContent}>
      <Select options={setterOptions} value={setter.concept || 'InputSetter'} onChange={handleChangeConcept} />
      {
        OptionsComponent && (
          <>
            <Divider dashed style={{ margin: '12px 0' }} />
            <OptionsComponent setter={setter as any} onChangeOptions={handleChangeOptions} />
          </>
        )
      }
    </div>
  ), [setter, setterOptions, handleChangeConcept, OptionsComponent, handleChangeOptions]);

  return (
    <div className={rootClassName} style={style} {...rest}>
      <Input className={styles.input} readOnly value={setterText} />
      <Popconfirm
        title="选择设置器"
        icon={null}
        description={setterContent}
        onOpenChange={handleOpenChange}
        placement="bottomRight"
        onConfirm={handleConfirm}
      >
        <Button className={styles.action}>
          <SettingOutlined style={{ width: 16, height: 16, justifyContent: 'center' }} />
        </Button>
      </Popconfirm>
  </div>
  );
};
