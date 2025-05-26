
import React, { useState } from 'react';
import { Anomaly, ParsedReceiptInfo } from '../types';
import { ReceiptIcon } from './icons/ReceiptIcon';
import { CameraIcon } from './icons/CameraIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { Modal } from './Modal';
import { ImagePreview } from './ImagePreview';

interface AnomalyCardProps {
  anomaly: Anomaly;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isOtherImagesModalOpen, setIsOtherImagesModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openImageModal = (imageBase64: string) => {
    setSelectedImage(imageBase64);
    // This logic needs rethinking if we have separate modals for receipt vs other images
    // For now, let's assume a generic image modal or handle within existing modals
  };

  const renderOcrContent = () => {
    if (!anomaly.ocrText) return <p className="text-xs text-slate-400 italic">Nessun dato OCR disponibile.</p>;
    try {
      const parsedOcr = JSON.parse(anomaly.ocrText) as ParsedReceiptInfo;
      return (
        <div className="space-y-1 text-xs">
          {parsedOcr.nome_esercizio && <p><strong>Esercizio (OCR):</strong> {parsedOcr.nome_esercizio}</p>}
          {parsedOcr.data && <p><strong>Data (OCR):</strong> {parsedOcr.data}</p>}
          {parsedOcr.importo_totale && <p><strong>Totale (OCR):</strong> {parsedOcr.importo_totale}</p>}
          {parsedOcr.articoli && parsedOcr.articoli.length > 0 && (
             <p><strong>Articoli (OCR):</strong> {parsedOcr.articoli.join(', ')}</p>
          )}
        </div>
      );
    } catch (e) {
      // If not JSON, display as raw string
      return <pre className="whitespace-pre-wrap text-xs">{anomaly.ocrText}</pre>;
    }
  };


  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 hover:border-cyan-600 transition-colors duration-200 transform hover:scale-[1.01]">
      <div className="flex items-start space-x-3">
        <AlertTriangleIcon className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
        <div>
          <p className="text-sm text-slate-400 mb-1">
            Segnalato il: {new Date(anomaly.submissionDate).toLocaleDateString('it-IT')}
          </p>
          <p className="text-slate-100 mb-3">{anomaly.description}</p>
        </div>
      </div>

      {(anomaly.receiptImageBase64 || anomaly.otherImagesBase64.length > 0) && (
        <div className="flex space-x-3 mt-3 pt-3 border-t border-slate-700">
          {anomaly.receiptImageBase64 && (
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md"
            >
              <ReceiptIcon className="w-4 h-4 mr-1.5" /> Vedi Scontrino
            </button>
          )}
          {anomaly.otherImagesBase64.length > 0 && (
            <button
              onClick={() => setIsOtherImagesModalOpen(true)}
              className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md"
            >
              <CameraIcon className="w-4 h-4 mr-1.5" /> Vedi {anomaly.otherImagesBase64.length} {anomaly.otherImagesBase64.length === 1 ? 'Immagine' : 'Immagini'}
            </button>
          )}
        </div>
      )}
      
      {anomaly.ocrText && (
        <div className="mt-3 pt-3 border-t border-slate-700">
            <h5 className="text-xs font-semibold text-cyan-500 mb-1">Dati OCR dallo Scontrino:</h5>
            {renderOcrContent()}
        </div>
      )}

      {anomaly.receiptImageBase64 && (
        <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Scontrino Allegato" size="lg">
          <img src={anomaly.receiptImageBase64} alt="Scontrino" className="w-full h-auto rounded-md max-h-[70vh] object-contain" />
        </Modal>
      )}

      {anomaly.otherImagesBase64.length > 0 && (
         <Modal isOpen={isOtherImagesModalOpen} onClose={() => setIsOtherImagesModalOpen(false)} title="Immagini Aggiuntive" size="xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {anomaly.otherImagesBase64.map((imgBase64, index) => (
                    <div key={index} className="bg-slate-700 p-2 rounded-md">
                        <img src={imgBase64} alt={`Immagine aggiuntiva ${index + 1}`} className="w-full h-auto rounded-md max-h-64 object-contain" />
                    </div>
                ))}
            </div>
        </Modal>
      )}
    </div>
  );
};
