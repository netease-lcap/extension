import { Input, InputProps, InputRef } from 'antd';
import { forwardRef, Ref, useCallback, useEffect, useState, ChangeEvent, FocusEvent } from 'react';

export interface SetInputProps extends Omit<InputProps, 'onChange'> {
  onChange?: (value?: string) => void;
}

export const SettingInput = forwardRef((props: SetInputProps, ref: Ref<InputRef>) => {
  const {
    value,
    onChange = () => {},
    onBlur = () => {},
    ...rest
  } = props;

  const [stateValue, setStateValue] = useState(value);

  useEffect(() => {
    if (value !== stateValue) {
      setStateValue(value);
    }
  }, [value]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setStateValue(e.target.value);
  }, []);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    onChange(stateValue as any);
    onBlur(e);
  }, [onChange, onBlur, stateValue])

  return (
    <Input
      {...rest}
      onChange={handleChange}
      onBlur={handleBlur}
      ref={ref}
    />
  );
});
