import React from 'react';
import { Business, Anomaly } from '../types';
import { Modal } from './Modal';
import { AnomalyCard } from './AnomalyCard';

interface BusinessDetailsModalProps {
  isOpen: boolean;
  business: Business;
  anomalies: Anomaly[];
  onClose: () => void;
}

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({ isOpen, business, anomalies, onClose }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Dettagli ${business.name}`} size="xl">
      {business.photoBase64 && (
        <div className="mb-4 flex justify-center">
          <img
            src={business.photoBase64}
            alt={business.name}
            className="max-h-60 object-contain rounded-md border border-slate-700"
          />
        </div>
      )}
      <div className="mb-4 space-y-1 text-sm text-slate-200">
        <p><strong>Indirizzo:</strong> {business.address}</p>
        <p><strong>Località:</strong> {business.location}</p>
        {business.piva && <p><strong>P.IVA:</strong> {business.piva}</p>}
        {typeof business.latitude === 'number' && typeof business.longitude === 'number' && (
          <p><strong>Coordinate:</strong> {business.latitude}, {business.longitude}</p>
        )}
      </div>
      <h3 className="text-lg font-semibold text-cyan-400 mb-2">
        Anomalie Segnalate ({anomalies.length})
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {anomalies.length > 0 ? (
          anomalies.map(anomaly => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} />
          ))
        ) : (
          <p className="text-slate-400">Nessuna anomalia per questa attività.</p>
        )}
      </div>
    </Modal>
  );
};
