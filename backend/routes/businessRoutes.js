const express = require('express');
const router = express.Router();
// Image data will be sent as Base64 strings, no file uploads needed
const User = require('../models/User');
const Business = require('../models/Business');
const Anomaly = require('../models/Anomaly');
const authMiddleware = require('../middleware/authMiddleware');
const { Sequelize } = require('sequelize'); // Import Sequelize


// POST /api/businesses - Create a new business
router.post('/', authMiddleware, async (req, res) => {
  try {
     const { name, address, latitude, longitude, p_iva, photoBase64, type } = req.body;

    // Validate input
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ message: 'Name, address, latitude, and longitude are required.' });
    }
    // Latitude and longitude are sent as strings from FormData, convert and validate
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || typeof lat !== 'number' || isNaN(lon) || typeof lon !== 'number') {
      return res.status(400).json({ message: 'Latitude and longitude must be valid numbers.' });
    }

    const photo_base64 = photoBase64 || null;

    const newBusiness = await Business.create({
      name,
      type,
      address,
      latitude: lat, // Use parsed latitude
      longitude: lon, // Use parsed longitude
      p_iva,
      photo_base64,
      addedBy: req.user.id // From authMiddleware
    });

    // Fetch the business with its association to return the username of the user who added it
    const businessWithUser = await Business.findByPk(newBusiness.id, {
        include: [{
            model: User,
            as: 'addedByUser', // Make sure this alias matches your model definition
            attributes: ['id', 'username'] // Select only specific user attributes
        }]
    });

    res.status(201).json(businessWithUser);

  } catch (error) {
    console.error('Error creating business:', { message: error.message, name: error.name, stack: error.stack, details: error });
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    } else if (error.name && error.name.startsWith('Sequelize')) {
      // Handle other Sequelize-specific errors
      const status = error.name === 'SequelizeUniqueConstraintError' ? 409 : 400;
      return res.status(status).json({
        message: 'Database error: ' + error.message,
        type: error.name,
        errors: error.errors ? error.errors.map(e => e.message) : []
      });
    }
    res.status(500).json({ message: 'Server error while creating business.' });
  }
});

// GET /api/businesses - Get a list of all businesses
// GET /api/businesses - Get a list of all businesses (with optional type filter)
router.get('/', async (req, res) => {
  try {
    // 1) Leggo il filtro dal client: ?type=bar, ?type=ristorante, ecc.
    const typeFilter = (req.query.type) || 'all';

    // 2) Costruisco il where dinamico
    const whereClause = {};
    if (typeFilter !== 'all') {
      whereClause.type = typeFilter;
    }

    // 3) Lancio la query con il where e il count delle anomalie
    const businesses = await Business.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'addedByUser',
          attributes: ['id', 'username']
        },
        {
          model: Anomaly,
          as: 'anomalies',
          attributes: []
        }
      ],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('anomalies.id')), 'anomalyCount']
        ]
      },
      group: ['Business.id', 'addedByUser.id']
    });

    res.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ message: 'Server error while fetching businesses.' });
  }
});


// GET /api/businesses/:id - Get details of a specific business
router.get('/:id', async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await Business.findByPk(businessId, {
      include: [
        {
          model: User,
          as: 'addedByUser',
          attributes: ['id', 'username']
        },
        {
          model: Anomaly,
          as: 'anomalies',
          include: [ // For each anomaly, include the user who reported it
            {
              model: User,
              as: 'reportedByUser',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    res.json(business);
  } catch (error) {
    console.error('Error fetching business details:', error);
    res.status(500).json({ message: 'Server error while fetching business details.' });
  }
});

// PUT /api/businesses/:id - Update a business
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await Business.findByPk(businessId);

    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    // Authorization check: only the user who added the business can update it
    if (business.addedBy !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to update this business.' });
    }

    const { name, address, latitude, longitude, photoBase64 } = req.body;

    // Basic validation for provided fields
    if (name !== undefined && !name.trim()) return res.status(400).json({ message: 'Name cannot be empty.' });
    if (address !== undefined && !address.trim()) return res.status(400).json({ message: 'Address cannot be empty.' });
    if (latitude !== undefined && typeof latitude !== 'number') return res.status(400).json({ message: 'Latitude must be a number.'});
    if (longitude !== undefined && typeof longitude !== 'number') return res.status(400).json({ message: 'Longitude must be a number.'});


    // Update only provided fields
    if (name !== undefined) business.name = name;
    if (address !== undefined) business.address = address;
    if (latitude !== undefined) business.latitude = latitude;
    if (longitude !== undefined) business.longitude = longitude;
    if (photoBase64 !== undefined) business.photo_base64 = photoBase64;

    await business.save();

    // Fetch the updated business with its 'addedByUser' association
    const updatedBusinessWithUser = await Business.findByPk(businessId, {
        include: [{
            model: User,
            as: 'addedByUser',
            attributes: ['id', 'username']
        }]
    });

    res.json(updatedBusinessWithUser);

  } catch (error) {
    console.error('Error updating business:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error while updating business.' });
  }
});

// DELETE /api/businesses/:id - Delete a business
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await Business.findByPk(businessId);

    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    // Authorization check: only the user who added the business can delete it
    if (business.addedBy !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to delete this business.' });
    }

    await business.destroy(); // This will also delete associated anomalies due to onDelete: 'CASCADE'

    res.json({ message: 'Business and associated anomalies deleted successfully.' });

  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ message: 'Server error while deleting business.' });
  }
});

module.exports = router;
