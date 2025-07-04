// backend/migrations/XXXXXXXX-add-unique-index-business.js
'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('Businesses', {
      fields: ['name','address','p_iva'],
      unique: true,
      name: 'unique_business_name_address_piva'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Businesses', 'unique_business_name_address_piva');
  }
};
