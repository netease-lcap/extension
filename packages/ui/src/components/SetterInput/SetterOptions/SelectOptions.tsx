import { useMemo, useCallback } from 'react';
import { Form, Input, Button, Flex } from 'antd';
import type { EnumSelectSetter, CapsulesSetter, SetterOption } from '@nasl/types/nasl.ui.ast';
import styles from './index.module.less';
import { IconAdd, IconTrash } from '../../icons';
import { getInputValueStringify } from '../../../utils/nasl';
import { SettingInput } from '../../SettingInput';

type SelectSetter = EnumSelectSetter | CapsulesSetter;
export interface SelectOptionsProps {
  setter: SelectSetter;
  onChangeOptions: (name: keyof SelectSetter, value: any | undefined) => void;
}

export interface SelectSetterOption extends Omit<SetterOption, 'concept' | 'changedTime'> {
  if?: (_: any) => boolean;
  disabledIf?: (_: any) => boolean;
}

const OptionInput = ({ value, showIcon, onChange }: { value: SelectSetterOption[], showIcon: boolean, onChange: (value: SelectSetterOption[]) => void }) => {
  const handleAddOption = useCallback(() => {
    onChange([...value, { title: '', value: '' }]);
  }, [value, onChange]);

  const handleChangeOption = useCallback((index: number, option: SelectSetterOption) => {
    onChange(value.map((item, i) => i === index ? option : item));
  }, [value, onChange]);

  const handleRemoveOption = useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index));
  }, [value, onChange]);

  return (
    <Flex vertical align="stretch" gap={8}>
      {
        value.map((item, index) => (
          <Flex className={styles.optionItem} gap={8} vertical align="stretch">
            <Flex gap={8}>
              <span className={styles.optionLabel}>文本</span>
              <Input value={item.title} onChange={(e) => handleChangeOption(index, { ...item, title: e.target.value || '' })} />
              <Button className={styles.optionButton} onClick={() => handleRemoveOption(index)}>
                <IconTrash />
              </Button>
            </Flex>
            {
              showIcon && (
                <Flex gap={8}>
                  <span className={styles.optionLabel}>图标</span>
                  <Input value={item.icon} onChange={(e) => handleChangeOption(index, { ...item, icon: e.target.value || undefined })} />
                </Flex>
              )
            }
            <Flex gap={8}>
              <span className={styles.optionLabel}>值</span>
              <SettingInput value={item.value} onChange={(v) => handleChangeOption(index, { ...item, value: getInputValueStringify(v) || '\'\'' })} />
            </Flex>
          </Flex>
        ))
      }
      <Button block onClick={handleAddOption}>
        <IconAdd />
        <span>添加选项</span>
      </Button>
    </Flex>
  )
}

export const SelectOptions = (props: SelectOptionsProps) => {
  const { setter, onChangeOptions } = props;

  const changeActions = useMemo(() => {
    return {
      options: (values: any[]) => onChangeOptions('options', values),
      multiple: (value: boolean | undefined) => onChangeOptions('multiple', value || undefined),
    };
  }, [onChangeOptions]);

  return (
    <Form layout="vertical">
      <Form.Item label="选项">
        <OptionInput value={setter.options} showIcon={setter.concept === 'CapsulesSetter'} onChange={changeActions.options} />
      </Form.Item>
      {/* <Form.Item label="是否多选">
        <Switch
          checked={setter.multiple}
          onChange={changeActions.multiple}
        />
      </Form.Item> */}
    </Form>
  );
};
