const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
const mockDb = {
  query: jest.fn()
};

const mockMessages = {
  english: {
    common: {
      validationError: 'Please provide all required fields'
    },
    auth: {
      weakPassword: 'Password must be at least 6 characters long',
      emailExists: 'Email already exists',
      registered: 'User registered successfully',
      invalidCredentials: 'Invalid email or password',
      unauthorized: 'Unauthorized access',
      loggedIn: 'User logged in successfully'
    }
  },
  dari: {
    common: {
      validationError: 'لطفاً تمام فیلدهای ضروری را ارائه دهید'
    },
    auth: {
      weakPassword: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
      emailExists: 'ایمیل از قبل وجود دارد',
      registered: 'کاربر با موفقیت ثبت نام شد',
      invalidCredentials: 'ایمیل یا رمز عبور نامعتبر',
      unauthorized: 'دسترسی غیرمجاز',
      loggedIn: 'کاربر با موفقیت وارد شد'
    }
  }
};

const mockConstants = {
  ROLES: {
    ADMIN: 'admin',
    STAFF: 'staff',
    MANAGER: 'manager'
  }
};

const jwtConfig = {
  secret: 'test-secret',
  expiresIn: '7d'
};

// Mock modules before requiring the controller
jest.mock('../../config/database', () => mockDb);
jest.mock('../../i18n/messages', () => mockMessages);
jest.mock('../../config/constants', () => mockConstants);
jest.mock('../../config/jwt', () => jwtConfig);

// Mock error handler
jest.mock('../../middleware/errorHandler', () => ({
  AppError: jest.fn().mockImplementation((message, statusCode, errorCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    error.errorCode = errorCode;
    return error;
  }),
  catchAsync: (fn) => fn
}));

const authController = require('../../controllers/authController');

describe('Auth Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('Register', () => {
    test('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'staff',
        branch_id: null,
        is_active: true,
        created_at: new Date()
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user (none found)
        .mockResolvedValueOnce({ rows: [mockUser] }); // Create user

      req.body = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'staff'
      };
      req.headers['accept-language'] = 'en-US';

      await authController.register(req, res, next);

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      
      // The response should include both user and token
      const responseCall = res.json.mock.calls[0];
      expect(responseCall[0]).toEqual({
        status: 'success',
        message: mockMessages.english.auth.registered,
        data: {
          user: mockUser,
          token: expect.any(String)
        }
      });
    });
  });

  describe('Login', () => {
    test('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'staff',
        branch_id: null,
        is_active: true
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({}); // For last_login update

      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      
      // The response should include both user and token
      const responseCall = res.json.mock.calls[0];
      expect(responseCall[0]).toEqual({
        status: 'success',
        message: mockMessages.english.auth.loggedIn,
        data: {
          user: expect.objectContaining({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'staff'
          }),
          token: expect.any(String)
        }
      });
    });
  });
});