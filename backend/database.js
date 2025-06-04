
// backend/database.js
const { Sequelize } = require('sequelize');
const path = require('path'); // Utile per gestire i path

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: console.log,
  pool: {
    afterCreate: (connection, done) => {
      // Esegui PRAGMA foreign_keys=OFF ogni volta che viene creato un nuovo client/connessione
      connection.run('PRAGMA foreign_keys = OFF', (err) => {
        done(err, connection);
      });
    }
  }
});
module.exports = sequelize;
