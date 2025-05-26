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
