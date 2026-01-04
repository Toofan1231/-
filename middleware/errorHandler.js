const messages = require('../i18n/messages');

class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  
  let response = {
    status: err.status,
    message: err.message,
    error: err.errorCode
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Handle specific JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    response.message = messages[lang].auth.tokenInvalid;
    response.error = 'token-invalid';
  }
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    response.message = messages[lang].auth.tokenExpired;
    response.error = 'token-expired';
  }

  res.status(err.statusCode).json(response);
};

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const notFound = (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  next(new AppError(messages[lang].common.notFound, 404, 'not-found'));
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
  notFound
};
