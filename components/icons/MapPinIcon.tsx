
import React from 'react';
import { IconBase } from './IconBase';

interface MapPinIconProps {
  className?: string;
}

export const MapPinIcon: React.FC<MapPinIconProps> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </IconBase>
);
