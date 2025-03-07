import { FC } from 'react';
import { IconProps } from './types';

export const IconArrowDown: FC<IconProps> = ({ color, style = {}, ...rest }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" { ...rest } style={{ color, ...style }}>
      <path d="M12.0278 5L13 5.97674L8 11L3 5.97675L3.97223 5L8 9.04651L12.0278 5Z" fill="currentColor"/>
    </svg>
  );
};
