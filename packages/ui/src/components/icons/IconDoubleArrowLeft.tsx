import { FC } from 'react';
import { IconProps } from './types';

export const IconDoubleArrowLeft: FC<IconProps> = ({ color, style = {}, ...rest }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" { ...rest } style={{ color, ...style }}>
      <path d="M8.29272 11.3L4.99274 7.99997L8.29272 4.69998L7.3501 3.75732L3.10742 7.99997L7.3501 12.2426L8.29272 11.3Z" fill="currentColor"/>
      <path d="M12.8927 11.3L9.59271 7.99997L12.8927 4.69998L11.9501 3.75732L7.7074 7.99997L11.9501 12.2426L12.8927 11.3Z" fill="currentColor"/>
    </svg>
  );
};
