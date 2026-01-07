const bcrypt = require('bcryptjs');

// Mock database module
const mockDb = {
  query: jest.fn()
};

// Mock messages module
const mockMessages = {
  english: {
    auth: {
      userNotFound: 'User not found',
      emailExists: 'Email already exists'
    }
  },
  dari: {
    auth: {
      userNotFound: 'کاربر پیدا نشد',
      emailExists: 'ایمیل از قبل وجود دارد'
    }
  }
};

// Mock constants
const mockConstants = {
  ROLES: {
    ADMIN: 'admin',
    STAFF: 'staff',
    MANAGER: 'manager'
  }
};

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../../config/database', () => mockDb);
jest.mock('../../i18n/messages', () => mockMessages);
jest.mock('../../config/constants', () => mockConstants);
jest.mock('../../config/jwt', () => ({
  bcryptRounds: 10
}));

// Mock error handler with simple mock
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

const userController = require('../../controllers/userController');

describe('User Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('getAllUsers', () => {
    test('should return all users with filtering', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com', role: 'staff' },
        { id: 2, name: 'User 2', email: 'user2@example.com', role: 'admin' }
      ];

      mockDb.query.mockResolvedValueOnce({
        rows: mockUsers
      });

      req.query = { branch_id: 1, role: 'staff', is_active: true };

      await userController.getAllUsers(req, res, next);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT u.id, u.name, u.email, u.role, u.branch_id, u.is_active, u.last_login, b.name as branch_name'),
        [1, 'staff', true]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: {
          users: mockUsers
        }
      });
    });

    test('should return all users without filters', async () => {
      const mockUsers = [{ id: 1, name: 'User 1', email: 'user1@example.com' }];

      mockDb.query.mockResolvedValueOnce({
        rows: mockUsers
      });

      await userController.getAllUsers(req, res, next);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1'),
        []
      );

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: {
          users: mockUsers
        }
      });
    });
  });

  describe('getUserById', () => {
    test('should return user by ID', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'staff'
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      req.params.id = '1';

      await userController.getUserById(req, res, next);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.id = $1'),
        ['1']
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: mockUser
        }
      });
    });

    test('should return 404 when user not found', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: []
      });

      req.params.id = '999';

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        errorCode: 'user-not-found'
      }));
    });
  });

  describe('createUser', () => {
    test('should create new user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'New User',
        email: 'new@example.com',
        role: 'staff',
        branch_id: 1
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({ rows: [mockUser] }); // Create user

      req.body = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        branch_id: 1,
        role: 'staff'
      };

      await userController.createUser(req, res, next);

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: mockUser
        }
      });
    });

    test('should fail when email already exists', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      req.body = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      };

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 409,
        errorCode: 'email-already-exists'
      }));
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'staff',
        branch_id: 1,
        is_active: true
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      req.params.id = '1';
      req.body = {
        name: 'Updated User',
        branch_id: 1,
        is_active: true
      };

      await userController.updateUser(req, res, next);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET name = COALESCE'),
        ['Updated User', 1, true, '1']
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: mockUser
        }
      });
    });

    test('should return 404 when user not found for update', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: []
      });

      req.params.id = '999';
      req.body = { name: 'Updated User' };

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        errorCode: 'user-not-found'
      }));
    });
  });

  describe('deleteUser', () => {
    test('should soft delete user successfully', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      req.params.id = '1';

      await userController.deleteUser(req, res, next);

      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
        ['1']
      );

      expect(res.status).toHaveBeenCalledWith(204);
    });

    test('should return 404 when user not found for deletion', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: []
      });

      req.params.id = '999';

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        errorCode: 'user-not-found'
      }));
    });
  });

  describe('changeUserRole', () => {
    test('should change user role successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      req.params.id = '1';
      req.body = { new_role: 'admin' };

      await userController.changeUserRole(req, res, next);

      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
        ['admin', '1']
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: mockUser
        }
      });
    });

    test('should fail when new role is not provided', async () => {
      req.params.id = '1';
      req.body = { new_role: '' };

      await userController.changeUserRole(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        errorCode: 'missing-role'
      }));
    });

    test('should return 404 when user not found for role change', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: []
      });

      req.params.id = '999';
      req.body = { new_role: 'admin' };

      await userController.changeUserRole(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        errorCode: 'user-not-found'
      }));
    });
  });
});