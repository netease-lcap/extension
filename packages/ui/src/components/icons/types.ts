import { HTMLAttributes } from 'react';

export interface IconProps extends HTMLAttributes<SVGElement> {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}
