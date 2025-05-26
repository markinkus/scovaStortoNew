
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 p-4 mt-auto shadow-top-lg shadow-cyan-500/10">
      <div className="container mx-auto text-center">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ScovaStorto. Tutti i diritti riservati (concettualmente).
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Questa è un'applicazione demo. I dati sono fittizi e non persistenti.
        </p>
      </div>
    </footer>
  );
};
