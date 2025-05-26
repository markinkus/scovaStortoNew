const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Business = require('../models/Business');
const Anomaly = require('../models/Anomaly');
const authMiddleware = require('../middleware/authMiddleware');
const { Sequelize } = require('sequelize'); // For potential use in complex queries

// Configure multer for anomaly file uploads
const anomalyUploadDir = path.join(__dirname, '..', 'uploads', 'anomaly_files');

if (!fs.existsSync(anomalyUploadDir)) {
  fs.mkdirSync(anomalyUploadDir, { recursive: true });
}

const anomalyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, anomalyUploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});

const anomalyUpload = multer({
  storage: anomalyStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sono permesse solo immagini!'), false);
    }
  }
});

// POST /api/anomalies - Report a new anomaly
router.post('/', authMiddleware, anomalyUpload.fields([
  { name: 'receiptPhoto', maxCount: 1 },
  { name: 'anomalyPhotos', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      description,
      businessId,
      ocr_business_name,
      ocr_p_iva,
      ocr_address,
      ocr_date,
      ocr_total_amount
    } = req.body;

    // 1. Validate input
    if (!description || !businessId) {
      return res.status(400).json({ message: 'Description and businessId are required.' });
    }
    if (description.trim() === '') {
      return res.status(400).json({ message: 'Description cannot be empty.' });
    }
    // businessId is string from FormData, convert and validate
    const parsedBusinessId = parseInt(businessId, 10);
    if (isNaN(parsedBusinessId)) {
        return res.status(400).json({ message: 'businessId must be a valid number.' });
    }

    if (!req.files || !req.files.receiptPhoto || !req.files.receiptPhoto[0]) {
      return res.status(400).json({ message: 'Receipt photo is required.' });
    }

    // 2. Verify that the Business exists
    const business = await Business.findByPk(parsedBusinessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found with the provided businessId.' });
    }

    const receipt_photo_url = `/uploads/anomaly_files/${req.files.receiptPhoto[0].filename}`;
    let anomaly_photo_urls = null;
    if (req.files.anomalyPhotos && req.files.anomalyPhotos.length > 0) {
      anomaly_photo_urls = req.files.anomalyPhotos.map(file => `/uploads/anomaly_files/${file.filename}`);
    }

    // 3. Create new anomaly
    const newAnomaly = await Anomaly.create({
      description,
      businessId: parsedBusinessId,
      reportedBy: req.user.id,
      receipt_photo_url,
      anomaly_photo_urls,
      ocr_business_name,
      ocr_p_iva,
      ocr_address,
      ocr_date,
      ocr_total_amount
    });

    // 4. Fetch and return the created anomaly with associations
    const anomalyWithDetails = await Anomaly.findByPk(newAnomaly.id, {
      include: [
        {
          model: User,
          as: 'reportedByUser',
          attributes: ['id', 'username']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'address'] // Include relevant business details
        }
      ]
    });

    res.status(201).json(anomalyWithDetails);

  } catch (error) {
    console.error('Error reporting anomaly:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error while reporting anomaly.' });
  }
});

// GET /api/anomalies - Get all anomalies (optionally filtered by businessId)
router.get('/', async (req, res) => {
  try {
    const { businessId } = req.query;
    const filter = {};

    if (businessId) {
      if (isNaN(parseInt(businessId))) {
        return res.status(400).json({ message: 'Invalid businessId. Must be a number.' });
      }
      filter.businessId = parseInt(businessId);
    }

    const anomalies = await Anomaly.findAll({
      where: filter,
      include: [
        {
          model: User,
          as: 'reportedByUser',
          attributes: ['id', 'username']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'address']
        }
      ],
      order: [['createdAt', 'DESC']] // Optional: order by creation date
    });

    res.json(anomalies);

  } catch (error) {
    console.error('Error fetching anomalies:', error);
    res.status(500).json({ message: 'Server error while fetching anomalies.' });
  }
});

// GET /api/anomalies/:id - Get details of a specific anomaly
router.get('/:id', async (req, res) => {
  try {
    const anomalyId = req.params.id;
    if (isNaN(parseInt(anomalyId))) {
        return res.status(400).json({ message: 'Invalid anomaly ID. Must be a number.' });
    }

    const anomaly = await Anomaly.findByPk(parseInt(anomalyId), {
      include: [
        {
          model: User,
          as: 'reportedByUser',
          attributes: ['id', 'username']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'address']
        }
      ]
    });

    if (!anomaly) {
      return res.status(404).json({ message: 'Anomaly not found.' });
    }

    res.json(anomaly);
  } catch (error) {
    console.error('Error fetching anomaly details:', error);
    res.status(500).json({ message: 'Server error while fetching anomaly details.' });
  }
});

// PUT /api/anomalies/:id - Update an anomaly
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const anomalyId = req.params.id;
    if (isNaN(parseInt(anomalyId))) {
        return res.status(400).json({ message: 'Invalid anomaly ID. Must be a number.' });
    }

    const anomaly = await Anomaly.findByPk(parseInt(anomalyId));

    if (!anomaly) {
      return res.status(404).json({ message: 'Anomaly not found.' });
    }

    // Authorization: only the user who reported it can update
    if (anomaly.reportedBy !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to update this anomaly.' });
    }

    const { description, photo_url } = req.body;

    // Validate input: description should not be empty if provided
    if (description !== undefined && description.trim() === '') {
        return res.status(400).json({ message: 'Description cannot be empty.' });
    }
    if (photo_url !== undefined && typeof photo_url !== 'string') { // photo_url can be set to empty string or null
        return res.status(400).json({ message: 'photo_url must be a string.' });
    }


    // Update only provided fields
    if (description !== undefined) anomaly.description = description;
    // Allow setting photo_url to null or an empty string to remove it
    if (photo_url !== undefined) anomaly.photo_url = photo_url === "" ? null : photo_url;


    await anomaly.save();

    // Fetch and return the updated anomaly with associations
    const updatedAnomalyWithDetails = await Anomaly.findByPk(anomaly.id, {
      include: [
        { model: User, as: 'reportedByUser', attributes: ['id', 'username'] },
        { model: Business, as: 'business', attributes: ['id', 'name', 'address'] }
      ]
    });

    res.json(updatedAnomalyWithDetails);

  } catch (error) {
    console.error('Error updating anomaly:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error while updating anomaly.' });
  }
});

// DELETE /api/anomalies/:id - Delete an anomaly
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const anomalyId = req.params.id;
    if (isNaN(parseInt(anomalyId))) {
        return res.status(400).json({ message: 'Invalid anomaly ID. Must be a number.' });
    }

    const anomaly = await Anomaly.findByPk(parseInt(anomalyId));

    if (!anomaly) {
      return res.status(404).json({ message: 'Anomaly not found.' });
    }

    // Authorization: only the user who reported it can delete
    if (anomaly.reportedBy !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to delete this anomaly.' });
    }

    await anomaly.destroy();

    res.json({ message: 'Anomaly deleted successfully.' });

  } catch (error) {
    console.error('Error deleting anomaly:', error);
    res.status(500).json({ message: 'Server error while deleting anomaly.' });
  }
});

module.exports = router;
