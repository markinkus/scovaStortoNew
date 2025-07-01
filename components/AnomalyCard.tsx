import React, { useState } from 'react';
import { Anomaly, ParsedReceiptInfo } from '../types';
import { ReceiptIcon } from './icons/ReceiptIcon';
import { CameraIcon } from './icons/CameraIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { Modal } from './Modal';

interface AnomalyCardProps {
  anomaly: Anomaly;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);

  const renderOcrContent = () => {
    if (!anomaly.ocrText) 
      return <p className="text-xs text-slate-400 italic">Nessun dato OCR disponibile.</p>;

    try {
      const parsedOcr = JSON.parse(anomaly.ocrText) as ParsedReceiptInfo;
      return (
        <div className="space-y-1 text-xs">
          {parsedOcr.nome_esercizio && <p><strong>Esercizio (OCR):</strong> {parsedOcr.nome_esercizio}</p>}
          {parsedOcr.data           && <p><strong>Data (OCR):</strong> {parsedOcr.data}</p>}
          {parsedOcr.importo_totale && <p><strong>Totale (OCR):</strong> {parsedOcr.importo_totale}</p>}
          {parsedOcr.articoli?.length > 0 && (
            <p><strong>Articoli (OCR):</strong> {parsedOcr.articoli.join(', ')}</p>
          )}
        </div>
      );
    } catch {
      return <pre className="whitespace-pre-wrap text-xs">{anomaly.ocrText}</pre>;
    }
  };

  const hasReceipt = Boolean(anomaly.receiptImageBase64);
  const hasOther  = Array.isArray(anomaly.otherImagesBase64) && anomaly.otherImagesBase64.length > 0;

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 hover:border-cyan-600 transition-colors duration-200 transform hover:scale-[1.01]">
      {/* Intestazione */}
      <div className="flex items-start space-x-3">
        <AlertTriangleIcon className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
        <div>
          <p className="text-sm text-slate-400 mb-1">
            Segnalato il: {new Date(anomaly.submissionDate).toLocaleDateString('it-IT')}
          </p>
          <p className="text-slate-100 mb-3">{anomaly.description}</p>
        </div>
      </div>

      {/* Mini-galleria inline */}
      {hasOther && (
        <div className="grid grid-cols-3 gap-2 mt-2 mb-3">
          {anomaly.otherImagesBase64!.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setIsImagesModalOpen(true)}
              className="p-0 focus:outline-none"
            >
              <img
                src={src}
                alt={`Prodotto ${idx + 1}`}
                className="w-full h-20 object-cover rounded-md border border-slate-600"
              />
            </button>
          ))}
        </div>
      )}

      {/* Pulsanti di apertura modal */}
      {(hasReceipt || hasOther) && (
        <div className="flex space-x-3 mt-3 pt-3 border-t border-slate-700">
          {hasReceipt && (
            <button
              onClick={() => setIsImagesModalOpen(true)}
              className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md"
            >
              <ReceiptIcon className="w-4 h-4 mr-1.5" /> Vedi Scontrino
            </button>
          )}
          {hasOther && (
            <button
              onClick={() => setIsImagesModalOpen(true)}
              className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md"
            >
              <CameraIcon className="w-4 h-4 mr-1.5" /> Vedi {anomaly.otherImagesBase64!.length} {anomaly.otherImagesBase64!.length === 1 ? 'Immagine' : 'Immagini'}
            </button>
          )}
        </div>
      )}

      {/* Sezione OCR */}
      {anomaly.ocrText && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <h5 className="text-xs font-semibold text-cyan-500 mb-1">Dati OCR dallo Scontrino:</h5>
          {renderOcrContent()}
        </div>
      )}

      {/* Modal con tutte le immagini */}
      {(hasReceipt || hasOther) && (
        <Modal
          isOpen={isImagesModalOpen}
          onClose={() => setIsImagesModalOpen(false)}
          title="Allegati Anomalia"
          size="xl"
        >
          <div className="space-y-4">
            {hasReceipt && (
              <div className="flex justify-center">
                <img
                  src={anomaly.receiptImageBase64!}
                  alt="Scontrino"
                  className="w-full h-auto rounded-md max-h-72 object-contain"
                />
              </div>
            )}
            {hasOther && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {anomaly.otherImagesBase64!.map((img, i) => (
                  <div key={i} className="bg-slate-700 p-2 rounded-md">
                    <img
                      src={img}
                      alt={`Immagine aggiuntiva ${i + 1}`}
                      className="w-full h-auto rounded-md max-h-64 object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
