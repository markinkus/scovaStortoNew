describe('Dummy Test', () => {
  it('should be able to require sequelize', () => {
    const Sequelize = require('sequelize');
    expect(Sequelize).toBeDefined();
  });

  it('should be able to require User model which requires database', () => {
    const User = require('../models/User'); // This will trigger database.js
    expect(User).toBeDefined();
  });
});
