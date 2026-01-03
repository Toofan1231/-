const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireSameUserOrAdmin } = require('../middleware/authorization');

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireAdmin(), userController.getAllUsers);
router.post('/', requireAdmin(), userController.createUser);
router.get('/:id', requireSameUserOrAdmin(), userController.getUserById);
router.put('/:id', requireSameUserOrAdmin(), userController.updateUser);
router.delete('/:id', requireAdmin(), userController.deleteUser);
router.put('/:id/role', requireAdmin(), userController.changeUserRole);

module.exports = router;
