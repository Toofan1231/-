const { Pool } = require('pg');

// Mock environment variables
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'paint_shop_accounting';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'password';
process.env.NODE_ENV = 'test';

const db = require('../../config/database');

describe('Database Configuration', () => {
  describe('Database Connection', () => {
    test('should export required methods', () => {
      expect(typeof db.query).toBe('function');
      expect(typeof db.transaction).toBe('function');
      expect(typeof db.testConnection).toBe('function');
      expect(typeof db.pool).toBe('object');
    });

    test('should create Pool with correct configuration', () => {
      expect(db.pool).toBeInstanceOf(Pool);
      expect(db.pool.options).toEqual({
        host: 'localhost',
        port: 5432,
        database: 'paint_shop_accounting',
        user: 'postgres',
        password: 'password'
      });
    });

    test('should handle query execution', async () => {
      // Mock the pool query method
      const mockResult = { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
      db.pool.query = jest.fn().mockResolvedValue(mockResult);

      const result = await db.query('SELECT * FROM users WHERE id = $1', [1]);

      expect(db.pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1',
        [1]
      );
      expect(result).toEqual(mockResult);
    });

    test('should log query in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Mock the console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      db.pool.query = jest.fn().mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      await db.query('SELECT * FROM users');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Executed query',
        expect.objectContaining({
          text: 'SELECT * FROM users',
          duration: expect.any(Number),
          rows: 0
        })
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    test('should handle query errors', async () => {
      const error = new Error('Query failed');
      db.pool.query = jest.fn().mockRejectedValue(error);

      await expect(db.query('INVALID SQL')).rejects.toThrow('Query failed');
    });

    test('should execute transactions successfully', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn()
      };

      db.pool.connect = jest.fn().mockResolvedValue(mockClient);

      const result = await db.transaction(async (client) => {
        await client.query('BEGIN');
        const queryResult = await client.query('SELECT 1');
        await client.query('COMMIT');
        return queryResult;
      });

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual({ rows: [] });
    });

    test('should rollback transaction on error', async () => {
      const error = new Error('Transaction failed');
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce() // BEGIN
          .mockRejectedValueOnce(error), // SELECT
        release: jest.fn()
      };

      db.pool.connect = jest.fn().mockResolvedValue(mockClient);

      await expect(db.transaction(async (client) => {
        await client.query('BEGIN');
        await client.query('SELECT * FROM invalid');
        return 'should not reach here';
      })).rejects.toThrow('Transaction failed');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should test database connection successfully', async () => {
      db.pool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await db.testConnection();

      expect(db.pool.query).toHaveBeenCalledWith('SELECT NOW()');
      expect(result).toBe(true);
    });

    test('should handle connection test failure', async () => {
      const error = new Error('Connection failed');
      db.pool.query = jest.fn().mockRejectedValue(error);

      // Mock console.error to suppress error output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await db.testConnection();

      expect(db.pool.query).toHaveBeenCalledWith('SELECT NOW()');
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });
  });
});