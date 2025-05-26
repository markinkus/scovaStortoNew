const { Sequelize } = require('sequelize');
const path = require('path'); // Utile per gestire i path

// Crea l'istanza di Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Il file database.sqlite sarà creato nella directory 'backend'
  storage: path.join(__dirname, 'database.sqlite'),
  logging: console.log, // Puoi impostarlo a 'false' per meno output in console
                         // o lasciare console.log per vedere le query SQL durante lo sviluppo
});

// Synchronize all models
// { alter: true } will attempt to update the table to match the model without dropping it
// { force: true } would drop the table if it already exists - use with caution
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch(err => {
    console.error('Error synchronizing database:', err);
  });

module.exports = sequelize;
