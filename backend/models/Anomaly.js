const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Anomaly = sequelize.define('Anomaly', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // Base64 version of the receipt photo
  receipt_photo_base64: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // Array of Base64 images for additional anomaly photos
  anomaly_photo_base64s: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ocr_business_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ocr_p_iva: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ocr_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ocr_date: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ocr_total_amount: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

Anomaly.associate = (models) => {
  // An Anomaly is reported by a User
  Anomaly.belongsTo(models.User, {
    foreignKey: 'reportedBy',
    as: 'reportedByUser'
  });

  // An Anomaly is associated with a Business
  Anomaly.belongsTo(models.Business, {
    foreignKey: 'businessId',
    as: 'business'
  });
};

module.exports = Anomaly;
