const request = require('supertest');
const express = require('express');
const sequelize = require('../database');
const businessRoutes = require('../routes/businessRoutes');
const authRoutes = require('../routes/auth'); // For creating a user and logging in
const User = require('../models/User');
const Business = require('../models/Business');
const Anomaly = require('../models/Anomaly'); // Required for Business model's associations

// Setup a minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes); // Mount auth routes for login
app.use('/api/businesses', businessRoutes);

// Mock the JWT_SECRET
process.env.JWT_SECRET = 'test_secret_key_for_jest';

describe('Business API Endpoints', () => {
  let testUserToken = '';
  let testUserId = null;

  beforeAll(async () => {
    // Clean up tables
    await User.destroy({ truncate: true, cascade: true });
    await Business.destroy({ truncate: true, cascade: true });
    await Anomaly.destroy({ truncate: true, cascade: true }); // Clear anomalies as they are linked to businesses

    // 1. Register a test user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'businesstester',
        email: 'businesstester@example.com',
        password: 'password123',
      });

    // 2. Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'businesstester@example.com',
        password: 'password123',
      });
    
    testUserToken = loginRes.body.token;
    testUserId = loginRes.body.user.id;
  });
  
  // Clean up Business table before each test in this suite
  beforeEach(async () => {
    await Business.destroy({ truncate: true, cascade: true });
    // Anomalies are cascaded, but good to be explicit if needed elsewhere
    await Anomaly.destroy({ truncate: true, cascade: true });
  });

  describe('POST /api/businesses', () => {
    it('should create a new business for an authenticated user', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          name: 'Test Business',
          address: '123 Test St',
          latitude: 34.0522,
          longitude: -118.2437,
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', 'Test Business');
      expect(res.body).toHaveProperty('addedBy', testUserId);
      expect(res.body.addedByUser).toHaveProperty('username', 'businesstester');
    });

    it('should fail to create a business for an unauthenticated user', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .send({
          name: 'Unauth Business',
          address: '456 Unauth Ave',
          latitude: 40.7128,
          longitude: -74.0060,
        });
      expect(res.statusCode).toEqual(401); // Or 403 depending on middleware
      expect(res.body).toHaveProperty('message', 'Access denied. No token provided.');
    });

    it('should fail to create a business with missing name', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          // name is missing
          address: '123 Test St',
          latitude: 34.0522,
          longitude: -118.2437,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Name, address, latitude, and longitude are required.');
    });
  });

  describe('GET /api/businesses', () => {
    it('should retrieve a list of businesses (even if empty)', async () => {
      const res = await request(app).get('/api/businesses');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should retrieve businesses with user and anomaly count', async () => {
      // Create a business first
      await Business.create({ 
        name: 'Biz with Anomalies', 
        address: '789 Anomaly Rd', 
        latitude: 35, 
        longitude: -119, 
        addedBy: testUserId 
      });
      // No anomalies added yet, count should be 0

      const res = await request(app).get('/api/businesses');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name', 'Biz with Anomalies');
      expect(res.body[0].addedByUser).toHaveProperty('username', 'businesstester');
      expect(res.body[0]).toHaveProperty('anomalyCount', '0'); // Sequelize count is a string
    });
  });

  describe('GET /api/businesses/:id', () => {
    it('should retrieve a specific business by ID', async () => {
      const newBusiness = await Business.create({
        name: 'Specific Business',
        address: '1 Specific Pl',
        latitude: 30,
        longitude: -100,
        addedBy: testUserId,
      });

      const res = await request(app).get(`/api/businesses/${newBusiness.id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Specific Business');
      expect(res.body.addedByUser).toHaveProperty('username', 'businesstester');
      expect(res.body).toHaveProperty('anomalies'); // Should be an array
    });

    it('should return 404 for a non-existent business ID', async () => {
      const res = await request(app).get('/api/businesses/99999');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Business not found.');
    });
  });
});
