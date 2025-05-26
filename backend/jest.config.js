module.exports = {
  testEnvironment: 'node',
  verbose: true,
  rootDir: '.', // Explicitly set rootDir to the current directory (backend/)
  moduleDirectories: ['node_modules'], // Only look in backend/node_modules
  testPathIgnorePatterns: ['/node_modules/', '/frontend/'],
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'], // Default, but be explicit
  setupFilesAfterEnv: ['./tests/setup.js'],
  clearMocks: true,
};
