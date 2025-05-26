
import React from 'react';
import { IconBase } from './IconBase';

interface PlusCircleIconProps {
  className?: string;
}

export const PlusCircleIcon: React.FC<PlusCircleIconProps> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </IconBase>
);
