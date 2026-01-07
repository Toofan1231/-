const request = require('supertest');
const express = require('express');

// Import the actual modules
const authController = require('../../controllers/authController');
const { errorHandler, notFound } = require('../../middleware/errorHandler');

// Mock the database connection for integration tests
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true)
}));

// Import messages for testing
const messages = require('../../i18n/messages');

describe('Auth API Integration Tests', () => {
  let testUser;
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    testUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'staff',
      branch_id: null,
      is_active: true
    };

    // Create a fresh app for each test
    app = express();
    app.use(express.json());
    
    // Use the actual controller functions
    app.post('/api/auth/register', authController.register);
    app.post('/api/auth/login', authController.login);
    
    // Add error handling
    app.use(notFound);
    app.use(errorHandler);
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const db = require('../../config/database');
      
      // Mock database responses
      db.query
        .mockResolvedValueOnce({ rows: [] }) // No existing user
        .mockResolvedValueOnce({ 
          rows: [{
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'staff',
            branch_id: null,
            is_active: true,
            created_at: new Date()
          }]
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'staff'
        })
        .set('Accept-Language', 'en-US');

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe(messages.english.auth.registered);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined(); // Should include JWT token
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: '',
          email: '',
          password: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    test('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    test('should return 409 for existing email', async () => {
      const db = require('../../config/database');
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('fail');
    });

    test('should register with Dari language support', async () => {
      const db = require('../../config/database');
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test User', email: 'test@example.com' }] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        .set('Accept-Language', 'da-AF');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe(messages.dari.auth.registered);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const db = require('../../config/database');
      const bcrypt = require('bcryptjs');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.query
        .mockResolvedValueOnce({ // Login query
          rows: [{
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'staff',
            branch_id: null,
            is_active: true
          }]
        })
        .mockResolvedValueOnce({}); // Update last_login query

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe(messages.english.auth.loggedIn);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be in response
      expect(response.body.data.token).toBeDefined(); // Should include JWT token
    });

    test('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    test('should return 401 for invalid credentials', async () => {
      const db = require('../../config/database');
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    test('should return 401 for inactive user', async () => {
      const db = require('../../config/database');
      const bcrypt = require('bcryptjs');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: 'test@example.com',
          password: hashedPassword,
          is_active: false
        }]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    test('should login with Dari language support', async () => {
      const db = require('../../config/database');
      const bcrypt = require('bcryptjs');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.query
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'staff',
            branch_id: null,
            is_active: true
          }]
        })
        .mockResolvedValueOnce({});

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .set('Accept-Language', 'da-AF');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(messages.dari.auth.loggedIn);
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/auth/unknown')
        .set('Accept-Language', 'en-US');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });

    test('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });
});