const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const messages = require('../i18n/messages');
const jwtConfig = require('../config/jwt');
const { ROLES } = require('../config/constants');

const signToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, branch_id } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';

  // Basic validation
  if (!name || !email || !password || !branch_id) {
    return next(new AppError(messages[lang].common.validationError, 400, 'missing-fields'));
  }

  // Password strength validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(new AppError(messages[lang].auth.weakPassword, 400, 'weak-password'));
  }

  // Check if email already exists
  const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return next(new AppError(messages[lang].auth.emailExists, 409, 'email-already-exists'));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, jwtConfig.bcryptRounds);

  // Create user
  const newUser = await db.query(
    'INSERT INTO users (name, email, password, branch_id, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, branch_id',
    [name, email, hashedPassword, branch_id, ROLES.STAFF]
  );

  res.status(201).json({
    status: 'success',
    message: messages[lang].auth.registered,
    data: {
      user: newUser.rows[0]
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

  // Update last login
  await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  const token = signToken({ id: user.id, email: user.email, role: user.role, branch_id: user.branch_id });

  delete user.password;

  res.status(200).json({
    status: 'success',
    message: messages[lang].auth.loggedIn,
    token,
    data: {
      user
    }
  });
});

const getCurrentUser = catchAsync(async (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  
  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.branch_id, u.is_active, u.last_login, u.created_at, b.name as branch_name 
     FROM users u 
     LEFT JOIN branches b ON u.branch_id = b.id 
     WHERE u.id = $1`,
    [req.user.id]
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0]
    }
  });
});

const logout = (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  res.status(200).json({
    status: 'success',
    message: messages[lang].auth.loggedOut
  });
};

const changePassword = catchAsync(async (req, res, next) => {
  const { current_password, new_password, confirm_password } = req.body;
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';

  if (!current_password || !new_password || !confirm_password) {
    return next(new AppError(messages[lang].common.validationError, 400, 'missing-fields'));
  }

  if (new_password !== confirm_password) {
    return next(new AppError('New passwords do not match', 400, 'password-mismatch'));
  }

  const result = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];

  if (!(await bcrypt.compare(current_password, user.password))) {
    return next(new AppError(messages[lang].auth.invalidCredentials, 401, 'invalid-current-password'));
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(new_password)) {
    return next(new AppError(messages[lang].auth.weakPassword, 400, 'weak-password'));
  }

  const hashedNewPassword = await bcrypt.hash(new_password, jwtConfig.bcryptRounds);

  await db.query(
    'UPDATE users SET password = $1, password_changed_at = NOW() WHERE id = $2',
    [hashedNewPassword, req.user.id]
  );

  res.status(200).json({
    status: 'success',
    message: messages[lang].auth.passwordChanged
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  console.log(`Forgot password requested for: ${req.body.email}`);
  res.status(200).json({
    status: 'success',
    message: 'If an account with that email exists, a reset link has been sent.'
  });
});

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  forgotPassword
};
