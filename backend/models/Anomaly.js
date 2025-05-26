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
  receipt_photo_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  anomaly_photo_urls: {
    type: DataTypes.JSON, // Store as JSON array of strings
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
