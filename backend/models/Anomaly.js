const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Anomaly = sequelize.define(
  "Anomaly",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    note_utente: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Base64 version of the receipt photo
    receipt_photo_base64: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Array of Base64 images for additional anomaly photos
    // Array di Base64 images per le foto aggiuntive
    anomaly_photo_base64s: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("anomaly_photo_base64s");
        try {
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      },
      set(val) {
        // al salvataggio serializziamo sempre in stringa
        this.setDataValue("anomaly_photo_base64s", JSON.stringify(val || []));
      },
    },
    ocr_business_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ocr_p_iva: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ocr_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ocr_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ocr_total_amount: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

Anomaly.associate = (models) => {
  // An Anomaly is reported by a User
  Anomaly.belongsTo(models.User, {
    foreignKey: "reportedBy",
    as: "reportedByUser",
  });

  // An Anomaly is associated with a Business
  Anomaly.belongsTo(models.Business, {
    foreignKey: "businessId",
    as: "business",
  });
};

module.exports = Anomaly;
