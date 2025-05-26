const request = require('supertest');
const express = require('express');
const sequelize = require('../database'); // Original sequelize instance
const authRoutes = require('../routes/auth');
const User = require('../models/User');

// Setup a minimal Express app for testing
const app = express();
app.use(express.json()); // Important for parsing JSON request bodies
app.use('/api/auth', authRoutes);

// Mock the JWT_SECRET for consistent token generation/verification in tests
// It's crucial this matches any secret used in your actual auth logic if not mocked globally
process.env.JWT_SECRET = 'test_secret_key_for_jest';

describe('Auth API Endpoints', () => {
  // Clean up the User table before each test in this suite
  beforeEach(async () => {
    await User.destroy({ truncate: true, cascade: false });
  });

  // Test POST /api/auth/register
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully.');
      expect(res.body.user).toHaveProperty('username', 'testuser');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).not.toHaveProperty('password_hash'); // Ensure password hash isn't returned
    });

    it('should fail to register with an existing username', async () => {
      // First, create a user
      await User.create({ username: 'existinguser', email: 'unique@example.com', password_hash: 'hashedpassword' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'newemail@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'Username already exists.');
    });

    it('should fail to register with an existing email', async () => {
      await User.create({ username: 'anotheruser', email: 'existing@example.com', password_hash: 'hashedpassword' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newusername',
          email: 'existing@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'Email already exists.');
    });

    it('should fail to register with missing username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Username, email, and password are required.');
    });
     it('should fail to register with password less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Password must be at least 6 characters long.');
    });
  });

  // Test POST /api/auth/login
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user to test login
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('password123', salt);
      await User.create({ username: 'loginuser', email: 'login@example.com', password_hash });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'loginuser');
      expect(res.body.user).toHaveProperty('email', 'login@example.com');
    });

    it('should fail to login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials. Password incorrect.');
    });

    it('should fail to login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials. User not found.');
    });
  });
});
