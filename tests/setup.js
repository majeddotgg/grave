// Test setup file for Jest
require('dotenv').config({ path: 'test.env' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '8889';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'root'; // MAMP default password
process.env.DB_NAME = 'islamic_grave_system_test';

// Global test timeout
jest.setTimeout(30000);

// Suppress console.log during tests unless explicitly needed
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
} 