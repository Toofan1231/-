const express = require('express');
const supplierController = require('../controllers/supplierController');
const { authenticateToken } = require('../middleware/auth');
const { ROLES } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');
const messages = require('../i18n/messages');

const router = express.Router();

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('da') ? 'dari' : 'english';
  
  if (req.user.role !== ROLES.ADMIN) {
    return next(new AppError(messages[lang].auth.forbidden, 403, 'forbidden'));
  }
  next();
};

// Apply authentication and admin check to all supplier routes
router.use(authenticateToken, requireAdmin);

// Routes
router.get('/', supplierController.getAllSuppliers);
router.post('/', supplierController.createSupplier);
router.get('/:id', supplierController.getSupplierById);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);
router.get('/:id/purchases', supplierController.getSupplierPurchases);

module.exports = router;