const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { AppError, catchAsync } = require('./errorHandler');
const messages = require('../i18n/messages');
const db = require('../config/database');

const authenticateToken = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';

  if (!token) {
    return next(new AppError(messages[lang].auth.unauthorized, 401, 'unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Check if user still exists and is active
    const userResult = await db.query(
      'SELECT id, name, email, role, branch_id, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return next(new AppError(messages[lang].auth.userNotFound, 401, 'user-not-found'));
    }

    const user = userResult.rows[0];
    if (!user.is_active) {
      return next(new AppError(messages[lang].auth.unauthorized, 401, 'user-inactive'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(messages[lang].auth.tokenExpired, 401, 'token-expired'));
    }
    return next(new AppError(messages[lang].auth.tokenInvalid, 401, 'token-invalid'));
  }
});

module.exports = {
  authenticateToken
};
