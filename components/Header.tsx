
import React from 'react';
import { APP_TITLE, APP_SLOGAN } from '../constants.ts';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 p-4 shadow-lg shadow-cyan-500/10 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangleIcon className="h-10 w-10 text-cyan-400 transform -rotate-12" />
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 tracking-tight">
              {APP_TITLE}
            </h1>
            <p className="text-sm text-slate-400 italic">{APP_SLOGAN}</p>
          </div>
        </div>
        {/* Possible future additions: User Profile, Settings Icon */}
      </div>
    </header>
  );
};
