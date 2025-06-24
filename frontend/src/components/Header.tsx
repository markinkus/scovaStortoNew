
import React from 'react';
import { APP_TITLE, APP_SLOGAN } from '../../constants';
import { AlertTriangleIcon } from '../../../components/icons/AlertTriangleIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#4a3b31] text-[#f0e5d8] p-4 shadow-md shadow-[#7a6a5c]/40 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangleIcon className="h-10 w-10 transform -rotate-12" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{APP_TITLE}</h1>
            <p className="text-sm italic">{APP_SLOGAN}</p>
          </div>
        </div>
        {/* Possible future additions: User Profile, Settings Icon */}
      </div>
    </header>
  );
};
