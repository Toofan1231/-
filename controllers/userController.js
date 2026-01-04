const db = require('../config/database');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const messages = require('../i18n/messages');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');

const getAllUsers = catchAsync(async (req, res, next) => {
  const { branch_id, role, is_active } = req.query;
  
  let queryText = `
    SELECT u.id, u.name, u.email, u.role, u.branch_id, u.is_active, u.last_login, b.name as branch_name 
    FROM users u 
    LEFT JOIN branches b ON u.branch_id = b.id 
    WHERE 1=1
  `;
  const queryParams = [];

  if (branch_id) {
    queryParams.push(branch_id);
    queryText += ` AND u.branch_id = $${queryParams.length}`;
  }
  if (role) {
    queryParams.push(role);
    queryText += ` AND u.role = $${queryParams.length}`;
  }
  if (is_active !== undefined) {
    queryParams.push(is_active);
    queryText += ` AND u.is_active = $${queryParams.length}`;
  }

  const result = await db.query(queryText, queryParams);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      users: result.rows
    }
  });
});

const getUserById = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.branch_id, u.is_active, u.last_login, b.name as branch_name 
     FROM users u 
     LEFT JOIN branches b ON u.branch_id = b.id 
     WHERE u.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return next(new AppError(messages[lang].auth.userNotFound, 404, 'user-not-found'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, branch_id, role } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';

  const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return next(new AppError(messages[lang].auth.emailExists, 409, 'email-already-exists'));
  }

  const hashedPassword = await bcrypt.hash(password, jwtConfig.bcryptRounds);

  const result = await db.query(
    'INSERT INTO users (name, email, password, branch_id, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, branch_id',
    [name, email, hashedPassword, branch_id, role || 'staff']
  );

  res.status(201).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { name, branch_id, is_active } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';

  const result = await db.query(
    'UPDATE users SET name = COALESCE($1, name), branch_id = COALESCE($2, branch_id), is_active = COALESCE($3, is_active), updated_at = NOW() WHERE id = $4 RETURNING id, name, email, role, branch_id, is_active',
    [name, branch_id, is_active, req.params.id]
  );

  if (result.rows.length === 0) {
    return next(new AppError(messages[lang].auth.userNotFound, 404, 'user-not-found'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  
  // Soft delete preferred
  const result = await db.query(
    'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return next(new AppError(messages[lang].auth.userNotFound, 404, 'user-not-found'));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const changeUserRole = catchAsync(async (req, res, next) => {
  const { new_role } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';

  if (!new_role) {
    return next(new AppError('New role is required', 400, 'missing-role'));
  }

  const result = await db.query(
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
    [new_role, req.params.id]
  );

  if (result.rows.length === 0) {
    return next(new AppError(messages[lang].auth.userNotFound, 404, 'user-not-found'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole
};
