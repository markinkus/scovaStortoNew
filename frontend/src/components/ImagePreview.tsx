
import React from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface ImagePreviewProps {
  src: string;
  alt: string;
  onRemove?: () => void;
  size?: string; // e.g., 'w-24 h-24', 'w-32 h-32'
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, onRemove, size = 'w-24 h-24' }) => {
  return (
    <div className={`relative group ${size} rounded-md overflow-hidden border-2 border-[#4a3b31] shadow-md`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Rimuovi immagine"
        >
          <XCircleIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
