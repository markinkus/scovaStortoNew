import React, { useState, ChangeEvent, useCallback } from 'react';
import { Business } from '../types';
import { Modal } from './Modal';
import { ImagePreview } from './ImagePreview';
import { UploadIcon } from './icons/UploadIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { LoadingSpinner } from './LoadingSpinner'; // Importa LoadingSpinner

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBusiness: (business: Omit<Business, 'id'>) => void;
}

const businessTypes: Business['type'][] = ['Ristorante', 'Albergo', 'Pizzeria', 'Bar', 'Negozio'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      reject(new Error(`Il file è troppo grande (max ${MAX_FILE_SIZE_MB}MB).`));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ isOpen, onClose, onAddBusiness }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Business['type']>(businessTypes[0]);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(''); // e.g., "Roma", "Milano"
  const [piva, setPiva] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const resetForm = useCallback(() => {
    setName('');
    setType(businessTypes[0]);
    setAddress('');
    setLocation('');
    setPiva('');
    setPhoto(null);
    setPhotoBase64(null);
    setLatitude('');
    setLongitude('');
    setError(null);
    setGeocodingError(null);
    setIsGeocoding(false);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setPhoto(file);
        setPhotoBase64(base64);
      } catch (e: any) {
        setError(e.message || "Errore durante la conversione dell'immagine.");
        setPhoto(null);
        setPhotoBase64(null);
      }
    }
  };

  const handleGeocode = async () => {
    if (!address.trim() || !location.trim()) {
      setGeocodingError("Indirizzo e località sono necessari per la geocodifica.");
      return;
    }
    setIsGeocoding(true);
    setGeocodingError(null);
    setError(null);

    const query = `${address.trim()}, ${location.trim()}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`;

    try {
      const response = await fetch(url, { headers: { 'Accept': 'application/json' }});
      if (!response.ok) {
        throw new Error(`Errore dalla rete Nominatim: ${response.statusText}`);
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const firstResult = data[0];
        setLatitude(firstResult.lat);
        setLongitude(firstResult.lon);
        setGeocodingError(null); // Clear previous error if successful
      } else {
        setGeocodingError("Nessuna coordinata trovata per l'indirizzo fornito.");
        setLatitude(''); // Clear previous coords if not found
        setLongitude('');
      }
    } catch (e: any) {
      console.error("Errore di geocodifica:", e);
      setGeocodingError(e.message || "Errore durante la ricerca delle coordinate.");
      setLatitude('');
      setLongitude('');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setGeocodingError(null);
    if (!name.trim() || !type || !address.trim() || !location.trim()) {
      setError("Nome, tipo, indirizzo e località sono obbligatori.");
      return;
    }

    const lat = latitude !== '' ? parseFloat(latitude) : undefined;
    const lon = longitude !== '' ? parseFloat(longitude) : undefined;

    if (latitude !== '' && isNaN(lat as number)) {
        setError("Latitudine non valida. Deve essere un numero.");
        return;
    }
    if (longitude !== '' && isNaN(lon as number)) {
        setError("Longitudine non valida. Deve essere un numero.");
        return;
    }

    const newBusinessData: Omit<Business, 'id'> = {
      name: name.trim(),
      type,
      address: address.trim(),
      location: location.trim(),
      piva: piva.trim() || undefined,
      photoBase64: photoBase64 || undefined,
      latitude: lat,
      longitude: lon,
    };
    onAddBusiness(newBusinessData);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Aggiungi Nuova Attività" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-cyan-300 mb-1">Nome Attività *</label>
          <input type="text" id="businessName" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" />
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-cyan-300 mb-1">Tipo *</label>
          <select id="businessType" value={type} onChange={(e) => setType(e.target.value as Business['type'])} required className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500">
            {businessTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>
        
        <div className="space-y-1">
            <label htmlFor="businessAddress" className="block text-sm font-medium text-cyan-300 mb-1">Indirizzo Completo *</label>
            <input type="text" id="businessAddress" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Es. Via Roma 10" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" />
        
            <label htmlFor="businessLocation" className="block text-sm font-medium text-cyan-300 mb-1">Località (Comune/Città) *</label>
            <input type="text" id="businessLocation" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Es. Roma" className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" />
        
            <button 
                type="button"
                onClick={handleGeocode}
                disabled={isGeocoding || !address.trim() || !location.trim()}
                className="mt-2 px-3 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md inline-flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGeocoding ? (
                    <>
                        <LoadingSpinner size="sm" /> 
                        <span className="ml-2">Ricerca...</span>
                    </>
                ) : (
                    <>
                        <MapPinIcon className="w-4 h-4 mr-1.5"/> Trova Coordinate da Indirizzo
                    </>
                )}
            </button>
            {geocodingError && <p className="text-xs text-red-400 mt-1">{geocodingError}</p>}
            {!geocodingError && latitude && longitude && !isGeocoding && <p className="text-xs text-green-400 mt-1">Coordinate trovate!</p>}
        </div>


        <div>
          <label htmlFor="businessPiva" className="block text-sm font-medium text-cyan-300 mb-1">Partita IVA (Opzionale)</label>
          <input type="text" id="businessPiva" value={piva} onChange={(e) => setPiva(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" />
        </div>

        <div>
          <label htmlFor="businessPhoto" className="block text-sm font-medium text-cyan-300 mb-1">Foto Attività (Opzionale, Max {MAX_FILE_SIZE_MB}MB)</label>
          <div className="mt-1 flex items-center space-x-4">
            <input type="file" id="businessPhoto" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <label htmlFor="businessPhoto" className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md inline-flex items-center transition-colors">
              <UploadIcon className="w-5 h-5 mr-2"/> Carica Foto
            </label>
            {photoBase64 && <ImagePreview src={photoBase64} alt="Anteprima foto attività" size="w-32 h-32" />}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-cyan-300 mb-1">
                    <MapPinIcon className="inline w-4 h-4 mr-1 text-cyan-400"/> Latitudine (Opzionale)
                </label>
                <input 
                    type="number" 
                    step="any" 
                    id="latitude" 
                    value={latitude} 
                    onChange={(e) => { setLatitude(e.target.value); setGeocodingError(null); }}
                    placeholder="Es. 45.4642"
                    className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" 
                />
            </div>
            <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-cyan-300 mb-1">
                    <MapPinIcon className="inline w-4 h-4 mr-1 text-cyan-400"/> Longitudine (Opzionale)
                </label>
                <input 
                    type="number" 
                    step="any" 
                    id="longitude" 
                    value={longitude} 
                    onChange={(e) => { setLongitude(e.target.value); setGeocodingError(null); }}
                    placeholder="Es. 9.1900"
                    className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" 
                />
            </div>
        </div>
         <p className="text-xs text-slate-400 mt-1">Le coordinate sono necessarie per visualizzare l'attività sulla mappa. Puoi provare a trovarle automaticamente con il pulsante sopra.</p>


        {error && <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{error}</p>}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors">
            Annulla
          </button>
          <button type="submit" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md shadow-md hover:shadow-lg shadow-cyan-500/30 transition-all">
            Aggiungi Attività
          </button>
        </div>
      </form>
    </Modal>
  );
};
