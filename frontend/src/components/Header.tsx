import React from 'react';
import { APP_TITLE, APP_SLOGAN } from '../../constants';
import { AlertTriangleIcon } from '../../../components/icons/AlertTriangleIcon';

export const Header: React.FC = () => (
  <header className="bg-[#4a3b31] text-[#f0e5d8] p-4 sm:p-6 shadow-md shadow-[#7a6a5c]/40 sticky top-0 z-50">
    <div className="container mx-auto flex flex-col items-center text-center sm:flex-row sm:justify-between sm:items-center">
      <div className="flex flex-col items-center sm:flex-row sm:space-x-3">
        <AlertTriangleIcon className="h-8 w-8 sm:h-10 sm:w-10 transform -rotate-12 mb-1 sm:mb-0" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {APP_TITLE}
          </h1>
          <p className="hidden sm:block text-xs sm:text-sm italic mt-1">
            {APP_SLOGAN}
          </p>
        </div>
      </div>
      {/* Spazio per futuro: profilo utente / settings */}
    </div>
  </header>
);
