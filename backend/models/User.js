const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // 

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Define associations here
User.associate = (models) => {
  // A User can add multiple Businesses
  User.hasMany(models.Business, {
    foreignKey: 'addedBy',
    as: 'businesses'
  });

  // A User can report multiple Anomalies
  User.hasMany(models.Anomaly, {
    foreignKey: 'reportedBy',
    as: 'reportedAnomalies'
  });
};

module.exports = User;
