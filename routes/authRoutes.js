const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
  handleValidation
} = require('../middleware/validationMiddleware');

router.get('/login', isGuest, authController.showLogin);
router.get('/register', isGuest, authController.showRegister);

router.post(
  '/register',
  isGuest,
  registerValidation,
  handleValidation({ view: 'auth/register', title: 'Create an account' }),
  authController.register
);

router.post(
  '/login',
  isGuest,
  loginValidation,
  handleValidation({ view: 'auth/login', title: 'Log in' }),
  authController.login
);

router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;
