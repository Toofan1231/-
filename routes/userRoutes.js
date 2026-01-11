const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireSameUserOrAdmin } = require('../middleware/authorization');

const router = express.Router();

router.use(authenticateToken);

// GET /api/users - List all users (admin only)
router.get('/', requireAdmin(), userController.getAllUsers);

// GET /api/users/:id - Get single user (self or admin only)
router.get('/:id', requireSameUserOrAdmin(), userController.getUserById);

// PUT /api/users/:id - Update user (self or admin only)
router.put('/:id', requireSameUserOrAdmin(), userController.updateUser);

// DELETE /api/users/:id - Soft delete user (admin only)
router.delete('/:id', requireAdmin(), userController.deleteUser);

// PUT /api/users/:id/role - Change user role (admin only)
router.put('/:id/role', requireAdmin(), userController.changeUserRole);

module.exports = router;
