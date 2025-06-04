const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_TEXT = process.env.GEMINI_MODEL_TEXT || 'gemini-2.5-flash-preview-04-17';

let ai = null;
if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    console.error('Errore inizializzazione GoogleGenAI:', err);
  }
}

router.get('/check', (req, res) => {
  res.json({ configured: !!ai });
});

router.post('/extract', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: 'Gemini API non configurata' });
  }
  const { imageBase64, businessNameHint } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 mancante' });
  }

  const mimeMatch = imageBase64.match(/^data:(image\/[\w+.-]+);base64,/);
  if (!mimeMatch) {
    return res.status(400).json({ error: 'Formato base64 non valido' });
  }
  const mimeType = mimeMatch[1];
  const pureBase64 = imageBase64.split(',')[1];

  const promptParts = [
    {
      text: `Analizza l'immagine di questo scontrino fiscale italiano. Estrai le seguenti informazioni e restituiscile ESCLUSIVAMENTE in formato JSON, seguendo questa struttura:\n{\n  "nome_esercizio": "string | null",\n  "p_iva": "string | null",\n  "indirizzo_esercizio": "string | null",\n  "data": "string | null (formato DD/MM/YYYY o YYYY-MM-DD)",\n  "articoli": ["string"],\n  "importo_totale": "string | null (con valuta, es. '12.34 EUR')",\n  "altro": "string | null (qualsiasi altra informazione rilevante non catturata altrove)"\n}\nSe un campo non e' chiaramente leggibile o non e' presente, omettilo dal JSON o impostalo a null.\n${businessNameHint ? `Il nome dell'esercizio commerciale potrebbe essere simile a \"${businessNameHint}\". Se lo deduci basandoti su questo suggerimento, specificalo nel campo 'altro' o assicurati che il nome sia corretto.` : ''}\nPresta attenzione ai dettagli e cerca di essere il piu' accurato possibile. Non includere alcuna spiegazione o testo aggiuntivo al di fuori del JSON.`
    },
    {
      inlineData: {
        mimeType,
        data: pureBase64,
      },
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ parts: promptParts }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    try {
      const data = JSON.parse(jsonStr);
      return res.json(data);
    } catch (e) {
      console.warn('Parsing JSON fallito, restituisco testo grezzo');
      return res.json({ raw: response.text });
    }
  } catch (err) {
    console.error('Errore chiamata Gemini:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
