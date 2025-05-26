const sequelize = require('../database'); // Path to your sequelize instance

beforeAll(async () => {
  // It's often better to use a separate in-memory SQLite DB for tests
  // or a dedicated test file that can be wiped.
  // For this example, we'll re-sync the existing configured DB.
  // If your database.js already connects to a specific file,
  // ensure this file is gitignored or is a dedicated test DB.
  // For true in-memory, you might reconfigure sequelize here:
  // await sequelize.close(); // Close existing connection if any
  // await sequelize.dialect.connectionManager._clearTypeParser(); // Needed for re-init
  // sequelize.options.storage = ':memory:'; // Force in-memory
  // await sequelize.authenticate(); // Re-authenticate with in-memory

  // Sync all models. { force: true } will drop tables first.
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close the database connection after all tests run
  await sequelize.close();
});

// Optional: Clear tables before each test if needed,
// though sync({ force: true }) in beforeAll might be sufficient for many cases.
// beforeEach(async () => {
//   await sequelize.sync({ force: true });
// });
