const { AppError } = require('./errorHandler');
const messages = require('../i18n/messages');
const { ROLES } = require('../config/constants');

const requireRole = (role) => {
  return (req, res, next) => {
    const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
    
    if (req.user.role !== role) {
      return next(new AppError(messages[lang].auth.forbidden, 403, 'forbidden'));
    }
    next();
  };
};

const requireAdmin = () => requireRole(ROLES.ADMIN);

const requireSameUserOrAdmin = () => {
  return (req, res, next) => {
    const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
    const userId = parseInt(req.params.id);

    if (req.user.role !== ROLES.ADMIN && req.user.id !== userId) {
      return next(new AppError(messages[lang].auth.forbidden, 403, 'forbidden'));
    }
    next();
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireSameUserOrAdmin
};
