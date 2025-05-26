const express = require('express');
const sequelize = require('./database'); // Import sequelize instance
const authRoutes = require('./routes/auth'); // Import auth routes
const businessRoutes = require('./routes/businessRoutes'); // Import business routes
const anomalyRoutes = require('./routes/anomalyRoutes'); // Import anomaly routes
const app = express();
const port = 3001;

// Middleware to parse JSON request bodies
app.use(express.json());

// Test database connection (already includes sync from database.js)
sequelize.authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Mount auth routes
app.use('/api/auth', authRoutes);
// Mount business routes
app.use('/api/businesses', businessRoutes);
// Mount anomaly routes
app.use('/api/anomalies', anomalyRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
