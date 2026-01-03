const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.use(authenticateToken);
router.get('/me', authController.getCurrentUser);
router.post('/change-password', authController.changePassword);

module.exports = router;
