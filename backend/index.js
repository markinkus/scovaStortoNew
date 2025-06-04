// backend/index.js
const path = require('path'); // Import path module
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const sequelize = require('./database'); // Importa l'istanza da backend/database.js
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businessRoutes');
const anomalyRoutes = require('./routes/anomalyRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

// Importa i modelli
const User = require('./models/User');
const Business = require('./models/Business'); // Assicurati che questo file esista e sia corretto
const Anomaly = require('./models/Anomaly');   // Assicurati che questo file esista e sia corretto

const app = express();
const port = process.env.PORT || 3001; // Usa process.env.PORT o 3001 come fallback

// Middleware per parsare JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Colleziona tutti i modelli in un oggetto per le associazioni
const models = {
  User,
  Business,
  Anomaly
  // Aggiungi qui altri modelli se ne hai
};

// Esegui le associazioni dei modelli
// Questo ciclo itera su ogni modello e, se ha una funzione 'associate', la chiama.
for (const modelName in models) {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
}

// Test opzionale della connessione (sync() già verifica la connessione)
sequelize.authenticate()
  .then(() => console.log('Connessione al database stabilita con successo.'))
  .catch(err => console.error('Impossibile connettersi al database:', err));

// Monta le routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/gemini', geminiRoutes);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Il backend è in esecuzione!' });
});

// Sincronizza il database e avvia il server
// Il server viene avviato SOLO se la sincronizzazione ha successo
sequelize.sync({ alter: true }) // Usa alter: true come da tuo README
  .then(() => {
    console.log('Database sincronizzato con successo.');
    app.listen(port, () => {
      console.log(`Server in ascolto su http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Impossibile sincronizzare il database:', err);
    process.exit(1); // È buona prassi uscire se il DB non è pronto
  });

// RIMUOVI questa chiamata duplicata a app.listen() se presente:
// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
// });