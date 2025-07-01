import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BusinessCard } from './components/BusinessCard';
import { AnomalyCard } from './components/AnomalyCard';
import { AnomalyFormModal } from './components/AnomalyFormModal';
import { AddBusinessModal } from './components/AddBusinessModal';
import { BusinessDetailsModal } from './components/BusinessDetailsModal';
import { BusinessMap } from './components/BusinessMap';
import { Business, Anomaly } from './types';
import { MOCK_BUSINESSES_DATA_KEY, MOCK_ANOMALIES_DATA_KEY } from './constants.ts';
import { PlusCircleIcon } from './components/icons/PlusCircleIcon';
import { AlertTriangleIcon } from './components/icons/AlertTriangleIcon';
import { InfoCircleIcon } from './components/icons/InfoCircleIcon';
import { checkApiKey } from './services/geminiService';

const initialMockBusinesses: Business[] = [ /* ... */ ];
const initialMockAnomalies: Anomaly[] = [ /* ... */ ];

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
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [isBusinessDetailsOpen, setIsBusinessDetailsOpen] = useState(false);
  const [isApiKeyAvailable, setIsApiKeyAvailable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem(MOCK_BUSINESSES_DATA_KEY, JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem(MOCK_ANOMALIES_DATA_KEY, JSON.stringify(anomalies));
  }, [anomalies]);

  useEffect(() => {
    setIsApiKeyAvailable(checkApiKey() !== null);
  }, []);

  const handleSelectBusiness = (businessId: string) => {
    const biz = businesses.find(b => b.id === businessId) || null;
    setSelectedBusiness(biz);
  };
  const handleOpenBusinessDetails = (businessId: string) => {
    const biz = businesses.find(b => b.id === businessId);
    if (biz) {
      setSelectedBusiness(biz);
      setIsBusinessDetailsOpen(true);
    }
  };
  const handleAddAnomaly = (newAnomaly: Anomaly) => {
    setAnomalies(prev => [newAnomaly, ...prev]);
  };
  const handleAddBusiness = (businessData: Omit<Business, 'id'>) => {
    const newBusiness: Business = {
      ...businessData,
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
    };
    setBusinesses(prev => [newBusiness, ...prev]);
  };

  const filteredBusinesses = businesses
    .filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const anomaliesForSelectedBusiness = selectedBusiness
    ? anomalies.filter(a => a.businessId === selectedBusiness.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-16 flex-grow container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-grow min-h-0">

          {/* MAPPA */}
          <div className="lg:col-span-3 h-[40vh] sm:h-[60vh] lg:h-full min-h-[200px]">
            <BusinessMap
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={handleSelectBusiness}
              onOpenDetails={handleOpenBusinessDetails}
            />
          </div>

          {/* LISTA + DETTAGLI */}
          <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0">

            {/* LISTA ATTIVITÀ */}
            <div className="flex flex-col flex-grow bg-[#f0e5d8]/70 rounded-lg border border-[#7a6a5c]/50 p-2 sm:p-4 overflow-hidden">
              <div className="flex justify-between items-center border-b border-[#7a6a5c] pb-2 mb-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#4a3b31]">
                  Attività Commerciali
                </h2>
                <button
                  onClick={() => setIsAddBusinessModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm sm:text-base py-1 px-2 sm:py-1.5 sm:px-3 rounded-md inline-flex items-center"
                >
                  <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  Aggiungi
                </button>
              </div>
              <input
                type="text"
                placeholder="Cerca attività, località, tipo..."
                className="w-full p-2 sm:p-3 rounded-md bg-[#f0e5d8] border border-[#7a6a5c] text-sm sm:text-base"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="mt-2 overflow-y-auto flex-grow pr-1 pl-1 sm:pr-2 sm:pl-2 space-y-2">
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map(b => (
                    <BusinessCard
                      key={b.id}
                      business={b}
                      isSelected={selectedBusiness?.id === b.id}
                      onSelectBusiness={handleSelectBusiness}
                      onOpenDetails={handleOpenBusinessDetails}
                    />
                  ))
                ) : (
                  <p className="text-[#6a5a4c] text-center py-6 text-sm">
                    Nessuna attività trovata.
                  </p>
                )}
              </div>
            </div>

            {/* DETTAGLI + ANOMALIE */}
            <div className="flex flex-col flex-grow bg-[#f0e5d8]/70 rounded-lg border border-[#7a6a5c]/50 p-2 sm:p-4 overflow-hidden">
              {selectedBusiness ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#f0e5d8] p-3 rounded-md shadow-inner mb-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-[#4a3b31] truncate">
                        {selectedBusiness.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#6a5a4c] mt-1">
                        {selectedBusiness.address} – {selectedBusiness.location} ({selectedBusiness.type})
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleOpenBusinessDetails(selectedBusiness.id)}
                        className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs sm:text-sm py-1 px-2 sm:py-1.5 sm:px-3 rounded-md inline-flex items-center"
                      >
                        <InfoCircleIcon className="w-4 h-4 mr-1" />
                        Dettagli
                      </button>
                      <button
                        onClick={() => setIsAnomalyFormOpen(true)}
                        className="bg-[#7a6a5c] hover:bg-[#5f4e42] text-white text-xs sm:text-sm py-1 px-2 sm:py-1.5 sm:px-3 rounded-md inline-flex items-center"
                      >
                        <PlusCircleIcon className="w-4 h-4 mr-1" />
                        Segnala
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-[#4a3b31] mb-2">
                    Anomalie Segnalate ({anomaliesForSelectedBusiness.length})
                  </h3>
                  <div className="overflow-y-auto flex-grow pr-1 pl-1 sm:pr-2 sm:pl-2 space-y-2">
                    {anomaliesForSelectedBusiness.length > 0 ? (
                      anomaliesForSelectedBusiness.map(a => (
                        <AnomalyCard key={a.id} anomaly={a} />
                      ))
                    ) : (
                      <p className="text-[#6a5a4c] text-center py-6 text-sm">
                        Nessuna anomalia segnalata per questa attività.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-grow text-center py-8">
                  <AlertTriangleIcon className="w-12 h-12 text-[#7a6a5c] mb-3" />
                  <h2 className="text-lg sm:text-xl text-[#6a5a4c] mb-2">Seleziona un'attività</h2>
                  <p className="text-[#7a6a5c] text-sm">
                    Seleziona un'attività dalla lista o clicca un marcatore sulla mappa.
                  </p>
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

      {selectedBusiness && (
        <BusinessDetailsModal
          isOpen={isBusinessDetailsOpen}
          business={selectedBusiness}
          anomalies={anomaliesForSelectedBusiness}
          onClose={() => setIsBusinessDetailsOpen(false)}
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
