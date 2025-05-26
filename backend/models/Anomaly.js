const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Anomaly = sequelize.define('Anomaly', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT, // TEXT for potentially longer descriptions
    allowNull: false
  },
  photo_url: {
    type: DataTypes.STRING,
    allowNull: true // Optional
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
