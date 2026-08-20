import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  registerValidators,
  loginValidators
} from '../controllers/authController.js';
import { handleValidationErrors } from '../middleware/error.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidators, handleValidationErrors, register);
router.post('/login', loginValidators, handleValidationErrors, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
