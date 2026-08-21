import express from 'express';
import {
  getAllUsers,
  updateUserStatus,
  updateUserStatusValidators
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors, asyncHandler } from '../middleware/error.js';

const router = express.Router();
router.get('/', authenticate, authorize('admin'), asyncHandler(getAllUsers));
router.put('/:id/status', authenticate, authorize('admin'), updateUserStatusValidators, handleValidationErrors, asyncHandler(updateUserStatus));
export default router;