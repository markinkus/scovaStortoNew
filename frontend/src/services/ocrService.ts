
import { ParsedReceiptInfo } from "../../types";

// Simula il caricamento e l'utilizzo di una libreria OCR client-side come PaddlePaddle.
// In uno scenario reale, ciò comporterebbe il caricamento di un modello WASM,
// il pre-processing dell'immagine, l'esecuzione del motore OCR e il post-processing dei risultati.

/**
 * Simula l'estrazione del testo da un'immagine di ricevuta utilizzando PaddlePaddle OCR.
 * @param imageBase64 Immagine codificata in Base64.
 * @param businessNameHint (Opzionale) Suggerimento sul nome dell'attività commerciale.
 * @returns Una promessa che si risolve con ParsedReceiptInfo, una stringa di errore, o null.
 */
export const extractTextWithPaddleOCR = async (
  imageBase64: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  businessNameHint?: string
): Promise<ParsedReceiptInfo | string | null> => {
  console.log("Simulazione OCR con PaddlePaddle per l'attività:", businessNameHint);

  // Simula un ritardo, poiché l'OCR può richiedere tempo
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

  // Simula una possibilità di fallimento o immagine illeggibile
  if (Math.random() < 0.15) {
    return "PaddleOCR (Simulato): Immagine non leggibile o errore durante l'elaborazione.";
  }

  // Simula un OCR riuscito con dati fittizi
  const mockOcrData: ParsedReceiptInfo = {
    nome_esercizio: businessNameHint || `Esercizio ${Math.floor(Math.random() * 1000)} (da PaddleOCR)`,
    data: new Date(Date.now() - Math.floor(Math.random()*10) * 86400000).toLocaleDateString('it-IT'), // Data casuale negli ultimi 10 giorni
    articoli: [`Articolo A (OCR) - ${(Math.random()*10).toFixed(2)}`, `Articolo B (OCR) - ${(Math.random()*20).toFixed(2)}`],
    importo_totale: (Math.random() * 50 + 5).toFixed(2) + " EUR",
    altro: "Dati estratti tramite simulazione PaddleOCR. Alcuni dettagli potrebbero essere generici."
  };
  
  // Simula uno scenario in cui l'OCR potrebbe restituire testo semplice se non riesce a strutturarlo
   if (Math.random() < 0.1) {
      return `Testo grezzo da PaddleOCR (Simulato): ${mockOcrData.nome_esercizio}, Data: ${mockOcrData.data}, Totale: ${mockOcrData.importo_totale}. Controllare l'immagine per i dettagli.`;
  }

  return mockOcrData;
};
