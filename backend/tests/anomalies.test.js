const request = require('supertest');
const express = require('express');
const sequelize = require('../database');
const anomalyRoutes = require('../routes/anomalyRoutes');
const authRoutes = require('../routes/auth'); // For creating a user and logging in
const businessRoutes = require('../routes/businessRoutes'); // For creating a business
const User = require('../models/User');
const Business = require('../models/Business');
const Anomaly = require('../models/Anomaly');

// Setup a minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/anomalies', anomalyRoutes);

// Mock the JWT_SECRET
process.env.JWT_SECRET = 'test_secret_key_for_jest';

describe('Anomaly API Endpoints', () => {
  let testUserToken = '';
  let testUserId = null;
  let testBusinessId = null;

  beforeAll(async () => {
    // Clean up tables
    await User.destroy({ truncate: true, cascade: true });
    await Business.destroy({ truncate: true, cascade: true });
    await Anomaly.destroy({ truncate: true, cascade: true });

    // 1. Register a test user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'anomalytester',
        email: 'anomalytester@example.com',
        password: 'password123',
      });

    // 2. Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'anomalytester@example.com',
        password: 'password123',
      });
    
    testUserToken = loginRes.body.token;
    testUserId = loginRes.body.user.id;

    // 3. Create a business to associate anomalies with
    const businessRes = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        name: 'Test Business for Anomalies',
        address: '123 Anomaly St',
        latitude: 34.0522,
        longitude: -118.2437,
      });
    testBusinessId = businessRes.body.id;
  });
  
  // Clean up Anomaly table before each test in this suite
  beforeEach(async () => {
    await Anomaly.destroy({ truncate: true, cascade: true });
  });

  describe('POST /api/anomalies', () => {
    it('should create a new anomaly for an authenticated user and existing business', async () => {
      const res = await request(app)
        .post('/api/anomalies')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          description: 'Test anomaly description',
          businessId: testBusinessId,
          photo_url: 'http://example.com/photo.jpg',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('description', 'Test anomaly description');
      expect(res.body).toHaveProperty('businessId', testBusinessId);
      expect(res.body).toHaveProperty('reportedBy', testUserId);
      expect(res.body.reportedByUser).toHaveProperty('username', 'anomalytester');
      expect(res.body.business).toHaveProperty('name', 'Test Business for Anomalies');
    });

    it('should fail to create an anomaly for an unauthenticated user', async () => {
      const res = await request(app)
        .post('/api/anomalies')
        .send({
          description: 'Unauth anomaly',
          businessId: testBusinessId,
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Access denied. No token provided.');
    });

    it('should fail to create an anomaly for a non-existent business', async () => {
      const res = await request(app)
        .post('/api/anomalies')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          description: 'Anomaly for non-existent business',
          businessId: 99999, // Non-existent business ID
        });
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Business not found with the provided businessId.');
    });
    
    it('should fail to create an anomaly with missing description', async () => {
      const res = await request(app)
        .post('/api/anomalies')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          // description is missing
          businessId: testBusinessId,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Description and businessId are required.');
    });
  });

  describe('GET /api/anomalies', () => {
    it('should retrieve a list of anomalies (even if empty)', async () => {
      const res = await request(app).get('/api/anomalies');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should retrieve anomalies with user and business details', async () => {
      // Create an anomaly first
      await Anomaly.create({
        description: 'Detailed Anomaly',
        businessId: testBusinessId,
        reportedBy: testUserId,
        photo_url: 'http://example.com/detailed.jpg'
      });

      const res = await request(app).get('/api/anomalies');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
      const anomaly = res.body[0];
      expect(anomaly).toHaveProperty('description', 'Detailed Anomaly');
      expect(anomaly.reportedByUser).toHaveProperty('username', 'anomalytester');
      expect(anomaly.business).toHaveProperty('name', 'Test Business for Anomalies');
    });

    it('should filter anomalies by businessId if provided', async () => {
       await Anomaly.create({
        description: 'Anomaly for specific business',
        businessId: testBusinessId,
        reportedBy: testUserId,
      });
      // Create another business and anomaly to ensure filtering works
      const otherBusinessRes = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ name: 'Other Biz', address: 'Other St', latitude: 1, longitude: 1 });
      await Anomaly.create({
        description: 'Anomaly for other business',
        businessId: otherBusinessRes.body.id,
        reportedBy: testUserId,
      });

      const res = await request(app).get(`/api/anomalies?businessId=${testBusinessId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0]).toHaveProperty('description', 'Anomaly for specific business');
      expect(res.body[0].businessId).toEqual(testBusinessId);
    });
  });
});
