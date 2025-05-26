
import React from 'react';
import { IconBase } from './IconBase';

interface UploadIconProps {
  className?: string;
}

export const UploadIcon: React.FC<UploadIconProps> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </IconBase>
);
