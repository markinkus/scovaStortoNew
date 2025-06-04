
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BusinessCard } from './components/BusinessCard';
import { AnomalyCard } from './components/AnomalyCard';
import { AnomalyFormModal } from './components/AnomalyFormModal';
import { AddBusinessModal } from './components/AddBusinessModal'; // Importa il nuovo modale
import { BusinessMap } from './components/BusinessMap';
import { Business, Anomaly } from './types';
import { MOCK_BUSINESSES_DATA_KEY, MOCK_ANOMALIES_DATA_KEY } from './constants';
import { PlusCircleIcon } from './components/icons/PlusCircleIcon';
import { AlertTriangleIcon } from './components/icons/AlertTriangleIcon';
import { checkApiKey } from './frontend/src/services/geminiService';

// Dati fittizi con coordinate
const initialMockBusinesses: Business[] = [
  { id: '1', name: 'Ristorante La Brace Ardente', type: 'Ristorante', address: 'Via Roma 10, Milano', location: 'Milano', piva: '12345678901', latitude: 45.4642, longitude: 9.1900 },
  { id: '2', name: 'Hotel Bellavista', type: 'Albergo', address: 'Lungomare Sud 5, Rimini', location: 'Rimini', piva: '09876543210', latitude: 44.0598, longitude: 12.5683 },
  { id: '3', name: 'Pizzeria Da Gigi', type: 'Pizzeria', address: 'Piazza Garibaldi 7, Napoli', location: 'Napoli', latitude: 40.8518, longitude: 14.2681 },
  { id: '4', name: 'Cyber Bar 2077', type: 'Bar', address: 'Corso Tech 42, Torino', location: 'Torino', latitude: 45.0703, longitude: 7.6869 },
  { id: '5', name: 'Negozio Hi-Fi Futura', type: 'Negozio', address: 'Viale Innovazione 1, Bologna', location: 'Bologna', latitude: 44.4949, longitude: 11.3426 },
];

const initialMockAnomalies: Anomaly[] = [
  { 
    id: 'a1', businessId: '1', description: 'Prezzo del vino eccessivo rispetto al menu esposto. Scontrino allegato.', 
    submissionDate: new Date(Date.now() - 86400000 * 2).toISOString(), verified: false,
    receiptImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    otherImagesBase64: [],
    ocrText: JSON.stringify({nome_esercizio: "La Brace Ardente (da OCR)", data: "2023-10-24", articoli: ["Vino Rosso", "Coperto"], importo_totale: "55.00 EUR"}),
  },
  { 
    id: 'a2', businessId: '3', description: 'Pizza arrivata bruciata su un lato, immangiabile.', 
    submissionDate: new Date(Date.now() - 86400000).toISOString(), verified: false,
    otherImagesBase64: ['data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='],
  }
];


const App: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const stored = localStorage.getItem(MOCK_BUSINESSES_DATA_KEY);
    return stored ? JSON.parse(stored) : initialMockBusinesses;
  });
  const [anomalies, setAnomalies] = useState<Anomaly[]>(() => {
    const stored = localStorage.getItem(MOCK_ANOMALIES_DATA_KEY);
    return stored ? JSON.parse(stored) : initialMockAnomalies;
  });
  
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAnomalyFormOpen, setIsAnomalyFormOpen] = useState(false);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false); // Stato per il nuovo modale
  const [isApiKeyAvailable, setIsApiKeyAvailable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem(MOCK_BUSINESSES_DATA_KEY, JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem(MOCK_ANOMALIES_DATA_KEY, JSON.stringify(anomalies));
  }, [anomalies]);

  useEffect(() => {
    setIsApiKeyAvailable(checkApiKey());
  }, []);

  const handleSelectBusiness = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    setSelectedBusiness(business || null);
  };

  const handleAddAnomaly = (newAnomaly: Anomaly) => {
    setAnomalies(prev => [newAnomaly, ...prev]);
  };

  const handleAddBusiness = (businessData: Omit<Business, 'id'>) => {
    const newBusiness: Business = {
      ...businessData,
      id: `b-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`, // ID più univoco
    };
    setBusinesses(prev => [newBusiness, ...prev]);
  };


  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.type.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name)); // Ordina alfabeticamente

  const anomaliesForSelectedBusiness = selectedBusiness 
    ? anomalies.filter(a => a.businessId === selectedBusiness.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-grow min-h-0">
          {/* Colonna Mappa */}
          <div className="lg:col-span-3 h-[50vh] lg:h-full min-h-[300px] lg:min-h-0">
            <BusinessMap 
              businesses={businesses} 
              selectedBusiness={selectedBusiness} 
              onSelectBusiness={handleSelectBusiness} 
            />
          </div>

          {/* Colonna Lista Attività e Dettagli */}
          <div className="lg:col-span-2 flex flex-col h-auto lg:h-full space-y-2 min-h-0">
            {/* Business List Section */}
            <div
              className="flex flex-col space-y-3 p-1 bg-[#f0e5d8]/70 rounded-lg border border-[#7a6a5c]/50 shadow-inner"
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: '45%' }}
            >
              <div className="flex justify-between items-center border-b-2 border-[#7a6a5c] pb-2 px-2 pt-1 flex-shrink-0">
                <h2 className="text-xl font-semibold text-[#4a3b31]">Attività Commerciali</h2>
                <button
                  onClick={() => setIsAddBusinessModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded-md inline-flex items-center transition-colors shadow-md hover:shadow-lg shadow-green-500/30 text-sm"
                  title="Aggiungi nuova attività"
                >
                  <PlusCircleIcon className="w-4 h-4 mr-1.5"/> Aggiungi
                </button>
              </div>
              <div className="px-2 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Cerca attività, località, tipo..."
                  className="w-full p-2 rounded-md bg-[#f0e5d8] border border-[#7a6a5c] focus:ring-[#7a6a5c] focus:border-[#7a6a5c] placeholder-[#7a6a5c]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="overflow-y-auto flex-grow pr-1 pl-2 space-y-3 min-h-0">
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map(business => (
                    <BusinessCard 
                      key={business.id} 
                      business={business} 
                      onSelectBusiness={handleSelectBusiness}
                      isSelected={selectedBusiness?.id === business.id}
                    />
                  ))
                ) : (
                  <p className="text-[#6a5a4c] text-center py-4">Nessuna attività trovata.</p>
                )}
              </div>
            </div>

            {/* Selected Business Details & Anomalies Section */}
            <div
              className="flex flex-col space-y-3 p-1 bg-[#f0e5d8]/70 rounded-lg border border-[#7a6a5c]/50 shadow-inner"
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: '55%' }}
            >
              {selectedBusiness ? (
                <>
                  <div className="bg-[#f0e5d8] p-3 rounded-lg shadow-md border border-[#7a6a5c] flex-shrink-0 mx-1 mt-1">
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="text-xl font-semibold text-[#4a3b31] truncate" title={selectedBusiness.name}>{selectedBusiness.name}</h2>
                      <button 
                        onClick={() => setIsAnomalyFormOpen(true)}
                        className="bg-[#7a6a5c] hover:bg-[#5f4e42] text-white font-semibold py-1.5 px-3 rounded-md inline-flex items-center transition-colors shadow-md hover:shadow-lg shadow-[#7a6a5c]/30 text-sm flex-shrink-0 ml-2"
                      >
                        <PlusCircleIcon className="w-4 h-4 mr-1.5"/> Segnala
                      </button>
                    </div>
                    <p className="text-xs text-[#6a5a4c]">{selectedBusiness.address} - {selectedBusiness.location} ({selectedBusiness.type})</p>
                    {selectedBusiness.piva && <p className="text-xs text-[#6a5a4c] mt-0.5">P.IVA: {selectedBusiness.piva}</p>}
                  </div>
                  <h3 className="text-lg font-semibold text-[#4a3b31] border-b border-[#7a6a5c] pb-1 flex-shrink-0 px-2">Anomalie Segnalate ({anomaliesForSelectedBusiness.length})</h3>
                  <div className="overflow-y-auto flex-grow pr-1 pl-2 space-y-3 min-h-0">
                    {anomaliesForSelectedBusiness.length > 0 ? (
                      anomaliesForSelectedBusiness.map(anomaly => (
                        <AnomalyCard key={anomaly.id} anomaly={anomaly} />
                      ))
                    ) : (
                      <p className="text-[#6a5a4c] text-center py-4">Nessuna anomalia segnalata per questa attività.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-[#f0e5d8]/50 rounded-lg border-2 border-dashed border-[#7a6a5c] p-6">
                  <AlertTriangleIcon className="w-12 h-12 text-[#7a6a5c] mb-3" />
                  <h2 className="text-lg text-[#6a5a4c]">Seleziona un'attività</h2>
                  <p className="text-[#7a6a5c] text-sm text-center">Visualizza i dettagli qui selezionando un'attività dalla lista o cliccando un marcatore sulla mappa.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {selectedBusiness && (
        <AnomalyFormModal 
          isOpen={isAnomalyFormOpen}
          onClose={() => setIsAnomalyFormOpen(false)}
          business={selectedBusiness}
          onAddAnomaly={handleAddAnomaly}
          isApiKeyAvailable={isApiKeyAvailable}
        />
      )}

      <AddBusinessModal
        isOpen={isAddBusinessModalOpen}
        onClose={() => setIsAddBusinessModalOpen(false)}
        onAddBusiness={handleAddBusiness}
      />
    </div>
  );
};

export default App;
