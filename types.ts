
export interface Business {
  id: string;
  name: string;
  type: 'Ristorante' | 'Albergo' | 'Pizzeria' | 'Bar' | 'Negozio' | 'Supermercato' | 'Macelleria';
  address: string;
  location: string; // e.g., "Roma", "Milano"
  piva?: string; // Partita IVA
  photoBase64?: string; // Base64 encoded image for the business itself
  latitude?: number;
  longitude?: number;
}

export interface Anomaly {
  id: string;
  businessId: string;
  description: string;
  receiptImageBase64?: string; // Base64 encoded image
  otherImagesBase64: string[]; // Array of Base64 encoded images
  ocrText?: string;
  issuesFound?: string[]; // e.g. ["Prezzo errato", "Prodotto non conforme"]
  submissionDate: string; // ISO string
  verified: boolean; // Potrebbe essere un enum: Pending, Verified, Rejected
}

// Per il testo OCR strutturato da Gemini
export interface ParsedReceiptInfo {
  nome_esercizio?: string;
  p_iva?: string;          // Aggiunto
  indirizzo_esercizio?: string; // Aggiunto
  data?: string;           // Può essere usato per la data dello scontrino
  articoli?: string[];
  importo_totale?: string;
  altro?: string;
}