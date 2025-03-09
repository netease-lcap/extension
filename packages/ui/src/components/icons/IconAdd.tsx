import { FC } from 'react';
import { IconProps } from './types';

export const IconAdd: FC<IconProps> = ({ color, style = {}, ...rest }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" { ...rest } style={{ color, ...style }}>
      <path d="M7.40009 8.6001V13H8.6001V8.6001H13V7.40009H8.6001V3H7.40009V7.40009H3V8.6001H7.40009Z" fill="currentColor"/>
    </svg>
  )
};
