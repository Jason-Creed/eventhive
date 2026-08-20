import express from 'express';
import {
  getAllUsers,
  updateUserStatus
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), asyncHandler(getAllUsers));
router.put('/:id/status', authenticate, authorize('admin'), asyncHandler(updateUserStatus));

export default router;
