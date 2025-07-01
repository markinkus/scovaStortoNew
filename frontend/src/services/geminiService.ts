import { get, post } from './api';
import { ParsedReceiptInfo } from '../../types';

export const checkApiKey = async (): Promise<boolean> => {
  try {
    const res = await get<{ configured: boolean }>('/gemini/check');
    return res.configured;
  } catch (err) {
    console.error('Errore verifica chiave Gemini', err);
    return false;
  }
};

export const extractTextWithGemini = async (
  imageBase64: string,
  businessNameHint?: string
): Promise<ParsedReceiptInfo | string | null> => {
  try {
    const data = await post<ParsedReceiptInfo | { raw?: string; error?: string }>(
      '/gemini/extract',
      { imageBase64, businessNameHint }
    );

    // 1) se c'è un errore esplicito, restituisco la stringa di errore
    if ((data as any).error) {
      return (data as any).error as string;
    }

    // 2) se arriva raw, provo a estrarne il JSON al suo interno
    if ((data as any).raw) {
      let raw = (data as any).raw as string;

      // rimuovo eventuali ```json fences
      const fence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fence && fence[1]) raw = fence[1];

      // cerco la porzione che va da { all'ultima }
      const objMatch = raw.match(/(\{[\s\S]*\})/);
      if (objMatch) {
        try {
          const parsed = JSON.parse(objMatch[1]);
          return parsed as ParsedReceiptInfo;
        } catch (e) {
          console.warn('Parsing JSON da raw fallito, restituisco raw:', e);
        }
      }

      // se non riesco a riparare, restituisco comunque raw per debug
      return raw;
    }

    // 3) altrimenti è già un ParsedReceiptInfo valido
    return data as ParsedReceiptInfo;

  } catch (err: any) {
    console.error('Errore chiamata server Gemini', err);
    return err?.response?.data?.error || err.message;
  }
};

/**
 * Genera automaticamente una descrizione dell'anomalia via AI.
 */
// aggiungi un nuovo metodo che prende anche le foto
export async function generateAnomalyDescription(
  businessName: string,
  ocrData: ParsedReceiptInfo,
  photoBase64s: string[]
): Promise<string> {
  // chiama /describe passando le immagini
  const res = await post<{ description: string }>('/gemini/describe', {
    businessName,
    ocrData,
    photoBase64s,    // ← array di base64
  });
  return res.description;
}

