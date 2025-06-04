// backend/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const sequelize = require('./database');

const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businessRoutes');
const anomalyRoutes = require('./routes/anomalyRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

const User = require('./models/User');
const Business = require('./models/Business');
const Anomaly = require('./models/Anomaly');

const app = express();
const port = process.env.PORT || 3001;

// Middleware generali
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Associazioni tra modelli (se ce ne sono)
// Esempio: User.associate({ Anomaly, Business, … });
const models = { User, Business, Anomaly };
for (const name in models) {
  if (typeof models[name].associate === 'function') {
    models[name].associate(models);
  }
}

// Test della connessione
sequelize.authenticate()
  .then(() => console.log('Connessione al database stabilita con successo.'))
  .catch(err => console.error('Impossibile connettersi al database:', err));

// Montaggio delle rotte
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------
// Qui entra in gioco la “magia” per risolvere il backup doppio
;(async () => {
  try {
    // 1) Disabilito temporaneamente il controllo delle foreign key
    await sequelize.query('PRAGMA foreign_keys = OFF');

    // 2) Se esistono, droppo le tabelle di backup lasciate da precedenti alter
    //    Notare che devo farlo per ogni modello che usi `sync({ alter: true })`.
    //    In questo esempio: Users_backup, Businesses_backup, Anomalies_backup.
    //
    //    Inoltre, il nome esatto generato da Sequelize è "<ModelName>_backup",
    //    quindi “Users_backup” (non “users_backup”). Se hai altri modelli, aggiungili qui.
    await sequelize.query('DROP TABLE IF EXISTS `Users_backup`');
    await sequelize.query('DROP TABLE IF EXISTS `Business_backup`');
    await sequelize.query('DROP TABLE IF EXISTS `Anomaly_backup`');

    // 3) Ora posso fare la sync con alter: true senza che SQLite protesti su unique constraint
    await sequelize.sync({ alter: false });

    // 4) Riattivo i controlli di foreign key
    await sequelize.query('PRAGMA foreign_keys = ON');

    console.log('Database sincronizzato con successo.');
    app.listen(port, () => {
      console.log(`Server in ascolto su http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Impossibile sincronizzare il database:', err);
    process.exit(1);
  }
})();
