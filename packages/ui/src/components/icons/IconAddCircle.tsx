import { FC } from 'react';
import { IconProps } from './types';

export const IconAddCircle: FC<IconProps> = ({ color, style = {}, ...rest }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" { ...rest } style={{ color, ...style }}>
      <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8ZM13 8C13 5.23858 10.7614 3 8 3C5.23858 3 3 5.23858 3 8C3 10.7614 5.23858 13 8 13C10.7614 13 13 10.7614 13 8ZM8.50049 4.99976V7.5H11V8.5H8.50049V10.9998H7.50049V8.5H5V7.5H7.50049V4.99976H8.50049Z" fill="currentColor"/>
    </svg>
  )
};
