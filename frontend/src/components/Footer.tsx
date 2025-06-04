
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#4a3b31] text-[#f0e5d8] p-4 mt-auto shadow-inner">
      <div className="container mx-auto text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} ScovaStorto. Tutti i diritti riservati (concettualmente).</p>
        <p className="text-xs mt-1">Questa è un'applicazione demo. I dati sono fittizi e non persistenti.</p>
      </div>
    </footer>
  );
};
