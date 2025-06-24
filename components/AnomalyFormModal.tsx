
import React, { useState, useCallback, ChangeEvent } from 'react';
import { Business, Anomaly, ParsedReceiptInfo } from '../types';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';
import { extractTextWithGemini } from '../frontend/src/services/geminiService'; // Modificato
import { ImagePreview } from './ImagePreview';
import { ReceiptIcon } from './icons/ReceiptIcon';
import { CameraIcon } from './icons/CameraIcon';

interface AnomalyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onAddAnomaly: (anomaly: Anomaly) => void;
  isApiKeyAvailable: boolean; // Ripristinato
}

const MAX_IMAGES = 3;
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

export const AnomalyFormModal: React.FC<AnomalyFormModalProps> = ({ isOpen, onClose, business, onAddAnomaly, isApiKeyAvailable }) => {
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptImageBase64, setReceiptImageBase64] = useState<string | null>(null);
  const [otherImages, setOtherImages] = useState<File[]>([]);
  const [otherImagesBase64, setOtherImagesBase64] = useState<string[]>([]);
  const [ocrText, setOcrText] = useState<string | ParsedReceiptInfo | null>(null);
  const [isLoadingOcr, setIsLoadingOcr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setDescription('');
    setReceiptImage(null);
    setReceiptImageBase64(null);
    setOtherImages([]);
    setOtherImagesBase64([]);
    setOcrText(null);
    setIsLoadingOcr(false);
    setError(null);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleReceiptUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setOcrText(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`L'immagine della ricevuta è troppo grande (max ${MAX_FILE_SIZE_MB}MB).`);
        setReceiptImage(null);
        setReceiptImageBase64(null);
        return;
      }
      setReceiptImage(file);
      try {
        const base64 = await fileToBase64(file);
        setReceiptImageBase64(base64);
        
        if (isApiKeyAvailable) {
          setIsLoadingOcr(true);
          const result = await extractTextWithGemini(base64, business.name); // Modificato
          setOcrText(result);
          setIsLoadingOcr(false);
        } else {
          setOcrText("Chiave API Gemini non disponibile. OCR non eseguito.");
        }
      } catch (e: any) {
        setError(e.message || "Errore durante la conversione dell'immagine.");
        setReceiptImage(null);
        setReceiptImageBase64(null);
        setIsLoadingOcr(false);
      }
    }
  };
  
  const handleOtherImagesUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, MAX_IMAGES - otherImages.length);
      const oversizedFiles = newFiles.filter(f => f.size > MAX_FILE_SIZE_BYTES);
      if (oversizedFiles.length > 0) {
        setError(`Alcuni file sono troppo grandi (max ${MAX_FILE_SIZE_MB}MB).`);
        return;
      }

      setOtherImages(prev => [...prev, ...newFiles].slice(0, MAX_IMAGES));
      try {
        const base64Promises = newFiles.map(file => fileToBase64(file));
        const newBase64Images = await Promise.all(base64Promises);
        setOtherImagesBase64(prev => [...prev, ...newBase64Images].slice(0, MAX_IMAGES));
      } catch (e: any) {
         setError(e.message || "Errore durante la conversione delle immagini.");
      }
    }
  };

  const removeOtherImage = (index: number) => {
    setOtherImages(prev => prev.filter((_, i) => i !== index));
    setOtherImagesBase64(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!description.trim()) {
      setError("La descrizione è obbligatoria.");
      return;
    }
    if (!receiptImageBase64) {
        setError("L'immagine dello scontrino è obbligatoria per la verifica OCR.");
        return;
    }
    if (!isApiKeyAvailable && receiptImageBase64) {
        setError("Impossibile inviare: l'OCR non è stato eseguito perché la chiave API di Gemini non è disponibile.");
        return;
    }
     if (typeof ocrText === 'string' && ocrText.toLowerCase().includes("errore")) {
        setError(`Errore OCR: ${ocrText}. Si prega di controllare l'immagine o riprovare. È comunque possibile inviare la segnalazione, ma i dati OCR potrebbero non essere accurati.`);
        // Non ritornare, permetti l'invio se l'utente lo desidera nonostante l'errore OCR
    }


    const newAnomaly: Anomaly = {
      id: Date.now().toString(), // Simple ID for demo
      businessId: business.id,
      description,
      receiptImageBase64: receiptImageBase64 || undefined,
      otherImagesBase64,
      ocrText: typeof ocrText === 'string' ? ocrText : JSON.stringify(ocrText, null, 2),
      submissionDate: new Date().toISOString(),
      verified: false, // Default to not verified
    };
    onAddAnomaly(newAnomaly);
    handleClose();
  };
  
  const renderOcrResult = () => {
    if (!ocrText) return null;

    if (typeof ocrText === 'string') {
      const isError = ocrText.toLowerCase().includes("errore") || 
                      ocrText.toLowerCase().includes("non disponibile") ||
                      ocrText.toLowerCase().includes("non leggibile");
      return <pre className={`whitespace-pre-wrap text-xs p-2 rounded_md ${isError ? 'bg-red-900/70 text-red-300' : 'bg-slate-700'}`}>{ocrText}</pre>;
    }

    const { nome_esercizio, data, articoli, importo_totale, altro } = ocrText as ParsedReceiptInfo;
    
    let nameMatchWarning = false;
    if (nome_esercizio && business.name.toLowerCase() !== nome_esercizio.toLowerCase()) {
        const cleanBusinessName = business.name.toLowerCase().replace(/ristorante|pizzeria|bar/gi, "").trim();
        const cleanOcrName = nome_esercizio.toLowerCase().replace(/ristorante|pizzeria|bar/gi, "").trim();
        if (!cleanOcrName.includes(cleanBusinessName) && !cleanBusinessName.includes(cleanOcrName)) {
            nameMatchWarning = true;
        }
    }

    return (
      <div className="space-y-1 text-sm">
        {nome_esercizio && <p><strong>Esercizio (OCR):</strong> {nome_esercizio} {nameMatchWarning && <span className="text-yellow-400 font-semibold">(ATTENZIONE: Potrebbe non corrispondere a "{business.name}")</span>}</p>}
        {data && <p><strong>Data (OCR):</strong> {data}</p>}
        {importo_totale && <p><strong>Totale (OCR):</strong> {importo_totale}</p>}
        {articoli && articoli.length > 0 && (
          <div><strong>Articoli (OCR):</strong> <ul className="list-disc list-inside ml-4">{articoli.map((art, i) => <li key={i}>{art}</li>)}</ul></div>
        )}
        {altro && <p><strong>Altro (OCR):</strong> {altro}</p>}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Segnala Anomalia per ${business.name}`} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-cyan-300 mb-1">
            Descrizione dell'anomalia *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-slate-700 border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-100 placeholder-slate-400"
            placeholder="Descrivi dettagliatamente il problema riscontrato..."
            required
          />
        </div>

        <div>
          <label htmlFor="receiptImage" className="block text-sm font-medium text-cyan-300 mb-1">
            Scontrino/Ricevuta * (Max {MAX_FILE_SIZE_MB}MB)
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              id="receiptImage"
              accept="image/*"
              onChange={handleReceiptUpload}
              className="hidden"
            />
            <label htmlFor="receiptImage" className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md inline-flex items-center transition-colors">
              <ReceiptIcon className="w-5 h-5 mr-2"/> Carica Scontrino
            </label>
            {receiptImageBase64 && <ImagePreview src={receiptImageBase64} alt="Anteprima scontrino" />}
          </div>
           {!isApiKeyAvailable && <p className="text-xs text-yellow-400 mt-1">Attenzione: Chiave API Gemini non configurata. L'OCR non verrà eseguito.</p>}
           {isApiKeyAvailable && <p className="text-xs text-slate-400 mt-1">L'OCR verrà eseguito tramite API Gemini.</p>}
        </div>

        {isLoadingOcr && <LoadingSpinner text="Analisi OCR (Gemini API) in corso..." />}
        {ocrText && (
          <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
            <h4 className="text-md font-semibold text-cyan-400 mb-2">Risultato OCR (Gemini API):</h4>
            {renderOcrResult()}
          </div>
        )}

        <div>
          <label htmlFor="otherImages" className="block text-sm font-medium text-cyan-300 mb-1">
            Altre Immagini (Max {MAX_IMAGES}, {MAX_FILE_SIZE_MB}MB per file)
          </label>
          <div className="mt-1 flex items-center space-x-4">
             <input
              type="file"
              id="otherImages"
              accept="image/*"
              multiple
              onChange={handleOtherImagesUpload}
              disabled={otherImages.length >= MAX_IMAGES}
              className="hidden"
            />
             <label htmlFor="otherImages" className={`cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md inline-flex items-center transition-colors ${otherImages.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <CameraIcon className="w-5 h-5 mr-2"/> Carica Immagini
            </label>
          </div>
          {otherImagesBase64.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {otherImagesBase64.map((src, index) => (
                <ImagePreview key={index} src={src} alt={`Immagine ${index + 1}`} onRemove={() => removeOtherImage(index)} />
              ))}
            </div>
          )}
        </div>
        
        {error && <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{error}</p>}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md shadow-md hover:shadow-lg shadow-cyan-500/30 transition-all duration-150 ease-in-out"
            disabled={isLoadingOcr || (!isApiKeyAvailable && !!receiptImage) } // Disabilita se API non disponibile e scontrino caricato
          >
            {isLoadingOcr ? <LoadingSpinner size="sm" /> : 'Invia Segnalazione'}
          </button>
        </div>
      </form>
    </Modal>
  );
};