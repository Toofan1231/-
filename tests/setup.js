const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
global.console = {
  ...console,
  // Uncomment to silence console.log during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  debug: jest.fn()
};

// Mock console.error to reduce noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {});

// Suppress unhandled promise rejection warnings
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global test utilities
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Common test data
global.testData = {
  validUser: {
    full_name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'staff'
  },
  adminUser: {
    full_name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  invalidUser: {
    full_name: '',
    email: 'invalid',
    password: '123'
  }
};