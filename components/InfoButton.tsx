import React from 'react';
import { InfoCircleIcon } from './icons/InfoCircleIcon';

interface InfoButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Pulsante per aprire i dettagli di un business.
 * Ferma la propagazione dell'evento per evitare click sul container genitore.
 */
export const InfoButton: React.FC<InfoButtonProps> = ({ onClick, className }) => (
  <button
    onClick={e => {
      e.stopPropagation();
      onClick();
    }}
    className={className || 'flex items-center text-cyan-500 hover:text-cyan-300 transition-colors'}
  >
    <InfoCircleIcon className="w-4 h-4 mr-1" />
    Dettagli
  </button>
);
