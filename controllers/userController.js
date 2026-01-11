const db = require('../config/database');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const messages = require('../i18n/messages');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const { ROLES } = require('../config/constants');

const getAllUsers = catchAsync(async (req, res, next) => {
  const { branch_id, role, is_active } = req.query;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  
  let queryText = `
    SELECT u.id, u.name, u.email, u.role, u.branch_id, u.is_active, u.last_login, b.name as branch_name 
    FROM users u 
    LEFT JOIN branches b ON u.branch_id = b.id 
    WHERE 1=1
  `;
  const queryParams = [];

  if (branch_id) {
    queryParams.push(branch_id);
    queryText += ` AND u.branch_id = ${queryParams.length}`;
  }
  if (role) {
    queryParams.push(role);
    queryText += ` AND u.role = ${queryParams.length}`;
  }
  if (is_active !== undefined) {
    queryParams.push(is_active === 'true');
    queryText += ` AND u.is_active = ${queryParams.length}`;
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
  const userId = req.params.id;

  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.branch_id, u.is_active, u.last_login, b.name as branch_name 
     FROM users u 
     LEFT JOIN branches b ON u.branch_id = b.id 
     WHERE u.id = $1`,
    [userId]
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

const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, branch_id, is_active } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  const userId = req.params.id;

  // Check if email is being changed and if it already exists
  if (email) {
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
    if (existingUser.rows.length > 0) {
      return next(new AppError(messages[lang].auth.emailExists, 409, 'email-already-exists'));
    }
  }

  const result = await db.query(
    'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), branch_id = COALESCE($3, branch_id), is_active = COALESCE($4, is_active), updated_at = NOW() WHERE id = $5 RETURNING id, name, email, role, branch_id, is_active',
    [name, email, branch_id, is_active, userId]
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
  const userId = req.params.id;
  
  // Soft delete - set is_active to false
  const result = await db.query(
    'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
    [userId]
  );

  if (result.rows.length === 0) {
    return next(new AppError(messages[lang].auth.userNotFound, 404, 'user-not-found'));
  }

  res.status(200).json({
    status: 'success',
    message: 'User deactivated successfully'
  });
});

const changeUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  const userId = req.params.id;

  if (!role) {
    return next(new AppError('Role is required', 400, 'missing-role'));
  }

  if (!Object.values(ROLES).includes(role)) {
    return next(new AppError('Invalid role', 400, 'invalid-role'));
  }

  const result = await db.query(
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
    [role, userId]
  );

  if (result.rows.length === 0) {
    return next(new AppError(messages[lang].auth.userNotFound, 404, 'user-not-found'));
  }

  res.status(200).json({
    status: 'success',
    message: 'User role updated successfully',
    data: {
      user: result.rows[0]
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole
};
