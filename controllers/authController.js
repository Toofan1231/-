const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const messages = require('../i18n/messages');
const { ROLES } = require('../config/constants');
const jwtConfig = require('../config/jwt');

const register = catchAsync(async (req, res, next) => {
  const { full_name, email, password, role } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';

  // Basic validation
  if (!full_name || !email || !password) {
    return next(new AppError(messages[lang].common.validationError, 400, 'missing-fields'));
  }

  // Password strength validation - minimum 6 characters
  if (password.length < 6) {
    return next(new AppError(messages[lang].auth.weakPassword, 400, 'weak-password'));
  }

  // Check if email already exists
  const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return next(new AppError(messages[lang].auth.emailExists, 409, 'email-already-exists'));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with default role 'staff' if not provided
  const userRole = role || ROLES.STAFF;
  const newUser = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, branch_id, is_active, created_at',
    [full_name, email, hashedPassword, userRole]
  );

  const user = newUser.rows[0];
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  res.status(201).json({
    status: 'success',
    message: messages[lang].auth.registered,
    data: {
      user,
      token
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';

  if (!email || !password) {
    return next(new AppError(messages[lang].auth.invalidCredentials, 400, 'missing-credentials'));
  }

  const result = await db.query(
    'SELECT id, name, email, password, role, branch_id, is_active FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError(messages[lang].auth.invalidCredentials, 401, 'invalid-credentials'));
  }

  if (!user.is_active) {
    return next(new AppError(messages[lang].auth.unauthorized, 401, 'user-inactive'));
  }

  // Return user data without password
  delete user.password;

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  // Update last login time
  await db.query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [user.id]
  );

  res.status(200).json({
    status: 'success',
    message: messages[lang].auth.loggedIn,
    data: {
      user,
      token
    }
  });
});

module.exports = {
  register,
  login
};
