
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ParsedReceiptInfo } from "../../types";
import { GEMINI_MODEL_TEXT } from "../../constants";

// Variabile per conservare l'istanza dell'AI e lo stato della chiave API
let ai: GoogleGenAI | null = null;
let apiKeyIsAvailable = false;
let GEMINI_API_KEY = "AIzaSyCUspjopyRDqf8iR-ftL7UsPyaYfAt1p_M";
try {
  if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    apiKeyIsAvailable = true;
  } else {
    console.warn("Chiave API Gemini non trovata in process.env.API_KEY. Le funzionalità OCR saranno limitate.");
    apiKeyIsAvailable = false;
  }
} catch (error) {
  console.error("Errore durante l'inizializzazione di GoogleGenAI:", error);
  apiKeyIsAvailable = false;
}

export const checkApiKey = (): boolean => {
  return apiKeyIsAvailable;
};

const getMimeTypeFromBase64 = (base64String: string): string | null => {
  const match = base64String.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/);
  return match ? match[1] : null; // Restituisce es. 'image/png'
};

export const extractTextWithGemini = async (
  imageBase64: string,
  businessNameHint?: string
): Promise<ParsedReceiptInfo | string | null> => {
  if (!ai) {
    return "Errore: Cliente Gemini API non inizializzato. Controlla la chiave API.";
  }

  const mimeType = getMimeTypeFromBase64(imageBase64);
  if (!mimeType) {
    return "Errore: Impossibile determinare il tipo MIME dell'immagine dallo scontrino.";
  }
  const pureBase64 = imageBase64.split(',')[1];


  const promptParts = [
    {
      text: `Analizza l'immagine di questo scontrino fiscale italiano. Estrai le seguenti informazioni e restituiscile ESCLUSIVAMENTE in formato JSON, seguendo questa struttura:
{
  "nome_esercizio": "string | null",
  "p_iva": "string | null",
  "indirizzo_esercizio": "string | null",
  "data": "string | null (formato DD/MM/YYYY o YYYY-MM-DD)",
  "articoli": ["string"],
  "importo_totale": "string | null (con valuta, es. '12.34 EUR')",
  "altro": "string | null (qualsiasi altra informazione rilevante non catturata altrove)"
}
Se un campo non è chiaramente leggibile o non è presente, omettilo dal JSON o impostalo a null.
${businessNameHint ? `Il nome dell'esercizio commerciale potrebbe essere simile a "${businessNameHint}". Se lo deduci basandoti su questo suggerimento, specificalo nel campo 'altro' o assicurati che il nome sia corretto.` : ''}
Presta attenzione ai dettagli e cerca di essere il più accurato possibile. Non includere alcuna spiegazione o testo aggiuntivo al di fuori del JSON.
`
    },
    {
      inlineData: {
        mimeType: mimeType,
        data: pureBase64,
      },
    },
  ];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ parts: promptParts }],
      config: {
        responseMimeType: "application/json", // Chiediamo JSON direttamente
        temperature: 0.2, // Temperatura bassa per risposte più fattuali
      }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData: ParsedReceiptInfo = JSON.parse(jsonStr);
      // Validazione di base della struttura
      if (typeof parsedData.nome_esercizio === 'undefined' && typeof parsedData.importo_totale === 'undefined') {
        // Potrebbe non essere la struttura attesa, restituisce la stringa per debug o ulteriore analisi
        console.warn("JSON parsato ma potrebbe non avere la struttura attesa:", parsedData);
        return `Dati parziali o non strutturati da Gemini: ${jsonStr}`;
      }
      return parsedData;
    } catch (e) {
      console.error("Gemini Service - Errore nel parsing JSON:", e);
      console.error("Stringa JSON ricevuta (dopo pulizia fences):", jsonStr);
      return `Errore nel parsing della risposta JSON da Gemini. Risposta grezza: ${response.text}`;
    }

  } catch (error: any) {
    console.error("Gemini Service - Errore API:", error);
    if (error.message && error.message.includes('API key not valid')) {
        return "Errore API Gemini: Chiave API non valida. Controlla la configurazione.";
    }
    return `Errore durante la chiamata all'API Gemini: ${error.message || 'Errore sconosciuto'}`;
  }
};
