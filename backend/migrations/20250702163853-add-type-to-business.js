module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Businesses', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'ristorante',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Businesses', 'type');
  }
};
