# ScovaStorto Project

ScovaStorto non aiuta le attività, ma le smaschera e mette a disposizione degli utenti una mappa delle “anomalie” culinarie.

---

## ScovaStorto: la piattaforma per smascherare le “anomalie” culinarie

### Abstract

ScovaStorto è un’app web pensata per i consumatori “detective”: 
permette di segnalare e localizzare difetti di preparazione, mancanze nel servizio, sostanze estranee negli alimenti,
prodotti andati a male, estraendo i dati dallo scontrino per verificare la veridicità dell'acquisto
e analizzando le foto per generare una descrizione dell'esperienza.

Tutte le segnalazioni finiscono su una mappa pubblica di “anomalie” gastronomiche.

---

### Missione

* **Esporre le malefatte**: Ogni utente può segnalare il “fuori menu” delle attività.
* **Verifica automatica**: L’OCR sullo scontrino assicura che la foto mostri davvero ciò che hai pagato.
* **Descrizione AI**: Un modello LLM multimodale sintetizza l’anomalia in una descrizione efficace.

---

**Vantaggi**:

* Comunità di consumatori che “controlla” la qualità dei pasti.
* Trasparenza: ogni segnalazione è pubblica e geolocalizzata.
* Ridotta frode: lo scontrino certifica l’ordine reale.

---

### Prospettive Future

* **Feed alimentare**: notifiche geolocalizzate sulle “anomalie” vicine.
* **Badge reputazionali**: locali con badge reputazionali, i peggiori in cima al podio.
* **Insights**: tassi di “porcheria” per zona, fascia di prezzo, tipologia di cucina.

---

*ScovaStorto: la bussola per orientarti tra le “anomalie” gastronomiche della tua città.*

---
---
---
---

## Features (Overview)

* Registrazione e login degli utenti con autenticazione JWT.
* Gli utenti possono aggiungere nuove attività con la loro posizione (latitudine/longitudine).
* Le attività vengono visualizzate su una mappa interattiva (Leaflet).
* Gli utenti autenticati possono segnalare anomalie per attività specifiche, includendo opzionalmente un URL di una foto.
* Elenco pubblico delle attività e delle anomalie segnalate.
* Gli utenti possono aggiornare/eliminare le attività e le anomalie che hanno creato.
* Interfaccia utente ispirata al legno con uno sfondo a gradiente marrone ripetuto.

## Getting Started

Queste istruzioni ti permetteranno di ottenere una copia del progetto e di farlo funzionare sulla tua macchina locale per scopi di sviluppo e test.

### Prerequisites

*   **Node.js**: Version 18.x or higher (due to dependencies like `@google/genai` and `react-router-dom` which recommend Node 20.x, though 18.x might work with warnings). You can check your version with `node -v`.
*   **npm**: Version 7.x or higher (comes with Node.js). You can check your version with `npm -v`.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory_name>
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```

    *   Set up environment variables:
        *   Copy the example environment file:

            ```bash
            cp .env.example .env
            ```


        *   Open the newly created `.env` file and replace `your_very_secret_key_replace_in_prod` with a strong, unique secret for `JWT_SECRET`. 
        *   Set also your Google Gemini API key in `GEMINI_API_KEY` so OCR requests can be processed server-side.

            ```env
            JWT_SECRET=your_actual_strong_secret_key_here
            GEMINI_API_KEY=your_google_gemini_key
            # Optional: override default model
            GEMINI_MODEL_TEXT=gemini-2.5-flash-preview-04-17
            ```


    *   Database Synchronization:
        *   L'applicazione utilizza `Sequelize` ed è configurata per sincronizzare automaticamente i modelli con il database usando `sequelize.sync({ alter: true })` all'avvio del server. Questo significa che le tabelle verranno create o modificate secondo necessità. Il file del database SQLite `(database.sqlite)` verrà creato nella directory backend.
    *   Start the backend server:
        ```bash
        npm start
        ```
        The backend server will typically run on `http://localhost:3001`. You should see console output indicating "Database synchronized successfully." and "Server listening at http://localhost:3001".

3.  **Frontend Setup:**
    *   Navigate to the frontend directory (from the project root):

        ```bash
        cd frontend
        ```

        (If you are in the `backend` directory, you can use `cd ../frontend`)
        
    *   Install dependencies:
        ```bash
        npm install
        ```
        *Note: You might see warnings about Node.js version compatibility for packages like `@google/genai` or `react-router-dom` if you are using Node.js 18.x. The application should still run, but Node.js 20.x is recommended for these packages.*
    *   API Configuration:
        *   The frontend is configured to proxy API requests starting with `/api` to the backend server (assumed to be running on `http://localhost:3001`). This is handled by the `vite.config.ts` file in the `frontend` directory. No separate `.env` file is needed in the frontend for the API URL during development.
    *   Start the frontend development server:
        ```bash
        npm run dev
        ```
        Il server di sviluppo del frontend sarà normalmente in esecuzione su `http://localhost:3000` (come configurato in vite.config.ts) oppure sulla prima porta disponibile successiva (ad esempio, 5173 se la 3000 è occupata; Vite indicherà la porta effettiva). Apri questo URL nel tuo browser web.

### Default Ports

*   **Frontend (Vite)**: `http://localhost:3000` (or next available, e.g., 5173)
*   **Backend (Node.js/Express)**: `http://localhost:3001`

Dovresti ora avere l’applicazione ScovaStorto in esecuzione in locale! Puoi registrare un nuovo utente, accedere, aggiungere attività e segnalare anomalie.

# Railway Deploy Settings

## Build Command:
```bash
npm install && cd frontend && npm install && npm run build && cd ../backend && npm install
```

## Start Command:
```bash
cd backend && npm start
```


```
