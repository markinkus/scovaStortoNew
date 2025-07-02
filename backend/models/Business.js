const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ristorante' // Default type, can be 'all' or any other type
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  p_iva: {
    type: DataTypes.STRING,
    allowNull: true // Optional VAT number
  },
  // Store business photo directly as Base64 to simplify image handling
  photo_base64: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

Business.associate = (models) => {
  // A Business is added by a User
  Business.belongsTo(models.User, {
    foreignKey: 'addedBy',
    as: 'addedByUser'
  });

  // A Business can have multiple Anomalies
  Business.hasMany(models.Anomaly, {
    foreignKey: 'businessId',
    as: 'anomalies',
    onDelete: 'CASCADE' // If a business is deleted, its anomalies will also be deleted
  });
};

module.exports = Business;
