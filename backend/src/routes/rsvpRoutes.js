import express from 'express';
import {
  createRSVP,
  deleteRSVP,
  getEventRSVPs,
  getMyRSVPs
} from '../controllers/rsvpController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors, asyncHandler } from '../middleware/error.js';

const router = express.Router();

router.post('/:id/rsvp', authenticate, handleValidationErrors, asyncHandler(createRSVP));
router.delete('/:id/rsvp', authenticate, asyncHandler(deleteRSVP));
router.get('/:id/rsvps', authenticate, authorize('organizer', 'admin'), asyncHandler(getEventRSVPs));
router.get('/my-rsvps', authenticate, asyncHandler(getMyRSVPs));

export default router;
