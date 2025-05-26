const { Sequelize } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Path to your SQLite database file
  logging: false // Disable logging for cleaner output, can be enabled for debugging
});

// Import models
const User = require('./models/User');
const Business = require('./models/Business');
const Anomaly = require('./models/Anomaly');

// Store models in an object to pass to associate functions
const models = {
  User,
  Business,
  Anomaly
};

// Call associate methods if they exist
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

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
