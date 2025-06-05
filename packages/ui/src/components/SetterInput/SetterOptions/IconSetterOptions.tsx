import { useMemo } from 'react';
import { Form, Input, Switch } from 'antd';
import type { IconSetter } from '@nasl/types/nasl.ui.ast';

export interface IconSetterOptionsProps {
  setter: IconSetter;
  onChangeOptions: (name: keyof IconSetter, value: any | undefined) => void;
}

export const IconSetterOptions = (props: IconSetterOptionsProps) => {
  const { setter, onChangeOptions } = props;

  const changeActions = useMemo(() => {
    return {
      customIconFont: (e: React.ChangeEvent<HTMLInputElement>) => onChangeOptions('customIconFont', e.target.value || undefined),
      hideUploadIcon: (value: boolean | undefined) => onChangeOptions('hideUploadIcon', value || undefined),
    };
  }, [onChangeOptions]);

  return (
    <Form layout="vertical">
      <Form.Item label="隐藏上传图标功能">
        <Switch
          checked={setter.hideUploadIcon}
          onChange={changeActions.hideUploadIcon}
        />
      </Form.Item>
      <Form.Item label="使用自定义图标字体">
        <Input
          value={setter.customIconFont}
          onChange={changeActions.customIconFont}
        />
      </Form.Item>
    </Form>
  );
};
