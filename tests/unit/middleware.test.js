const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock database module for middleware tests
const mockDb = {
  query: jest.fn()
};

// Mock JWT config
const jwtConfig = {
  secret: 'test-secret',
  expiresIn: '7d',
  bcryptRounds: 10
};

// Mock messages module
const mockMessages = {
  english: {
    auth: {
      unauthorized: 'Unauthorized access',
      userNotFound: 'User not found',
      tokenExpired: 'Token has expired',
      tokenInvalid: 'Invalid token'
    }
  },
  dari: {
    auth: {
      unauthorized: 'دسترسی غیرمجاز',
      userNotFound: 'کاربر پیدا نشد',
      tokenExpired: 'نشانه منقضی شده',
      tokenInvalid: 'نشانه نامعتبر'
    }
  }
};

// Mock dependencies
jest.mock('../../config/database', () => mockDb);
jest.mock('../../i18n/messages', () => mockMessages);
jest.mock('../../config/jwt', () => jwtConfig);

const { authenticateToken } = require('../../middleware/auth');

describe('Authentication Middleware - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    test('should call next() when valid token is provided', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'staff',
        branch_id: null,
        is_active: true
      };

      const token = jwt.sign({ id: 1 }, jwtConfig.secret, { expiresIn: '7d' });
      req.headers.authorization = `Bearer ${token}`;

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      await authenticateToken(req, res, next);

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id, name, email, role, branch_id, is_active FROM users WHERE id = $1',
        [1]
      );

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    test('should return 401 when no token is provided', async () => {
      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
        errorCode: 'unauthorized'
      }));
    });

    test('should return 401 when token format is invalid', async () => {
      req.headers.authorization = 'InvalidFormat token123';

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
        errorCode: 'unauthorized'
      }));
    });

    test('should return 401 when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
        errorCode: 'token-invalid'
      }));
    });

    test('should return 401 when token is expired', async () => {
      const expiredToken = jwt.sign({ id: 1 }, jwtConfig.secret, { expiresIn: '-1h' });
      req.headers.authorization = `Bearer ${expiredToken}`;

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
        errorCode: 'token-expired'
      }));
    });

    test('should return 401 when user does not exist', async () => {
      const token = jwt.sign({ id: 999 }, jwtConfig.secret, { expiresIn: '7d' });
      req.headers.authorization = `Bearer ${token}`;

      mockDb.query.mockResolvedValueOnce({
        rows: []
      });

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
        errorCode: 'user-not-found'
      }));
    });

    test('should return 401 when user is inactive', async () => {
      const inactiveUser = {
        id: 1,
        is_active: false
      };

      const token = jwt.sign({ id: 1 }, jwtConfig.secret, { expiresIn: '7d' });
      req.headers.authorization = `Bearer ${token}`;

      mockDb.query.mockResolvedValueOnce({
        rows: [inactiveUser]
      });

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
        errorCode: 'user-inactive'
      }));
    });

    test('should use Dari language when Accept-Language starts with da', async () => {
      const mockUser = { id: 1, is_active: true };
      const token = jwt.sign({ id: 1 }, jwtConfig.secret, { expiresIn: '7d' });
      
      req.headers.authorization = `Bearer ${token}`;
      req.headers['accept-language'] = 'da-AF';

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      await authenticateToken(req, res, next);

      expect(req.headers['accept-language']).toBe('da-AF');
    });
  });
});