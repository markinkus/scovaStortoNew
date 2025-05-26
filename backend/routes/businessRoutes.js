const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const path = require('path'); // For manipulating file paths
const fs = require('fs'); // For file system operations, like creating directories
const User = require('../models/User');
const Business = require('../models/Business');
const Anomaly = require('../models/Anomaly');
const authMiddleware = require('../middleware/authMiddleware');
const { Sequelize } = require('sequelize'); // Import Sequelize

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '..', 'uploads', 'shop_photos');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use a timestamp and the original extension to create a unique filename
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: function (req, file, cb) {
    // Allow only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  }
});

// POST /api/businesses - Create a new business
router.post('/', authMiddleware, upload.single('shopPhoto'), async (req, res) => {
  try {
    const { name, address, latitude, longitude, p_iva } = req.body; // Include p_iva

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

    let photo_url = null;
    if (req.file) {
      // Construct the URL path for the photo. Assumes 'uploads' is served statically.
      photo_url = `/uploads/shop_photos/${req.file.filename}`;
    }

    const newBusiness = await Business.create({
      name,
      address,
      latitude: lat, // Use parsed latitude
      longitude: lon, // Use parsed longitude
      p_iva, // Add p_iva
      photo_url, // Add photo_url
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
    console.error('Error creating business:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error while creating business.' });
  }
});

// GET /api/businesses - Get a list of all businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.findAll({
      include: [
        {
          model: User,
          as: 'addedByUser',
          attributes: ['id', 'username']
        },
        {
          model: Anomaly,
          as: 'anomalies',
          attributes: [] // We only want the count, not the actual anomaly data here
        }
      ],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('anomalies.id')), 'anomalyCount']
        ]
      },
      group: ['Business.id', 'addedByUser.id'] // Group by business and the included user
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

    const { name, address, latitude, longitude } = req.body;

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
