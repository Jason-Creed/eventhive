import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents
} from '../controllers/eventController.js';
import { authenticate, authorize, isEventOwner } from '../middleware/auth.js';
import { handleValidationErrors, asyncHandler } from '../middleware/error.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.get('/', asyncHandler(getEvents));
router.get('/my-events', authenticate, authorize('organizer', 'admin'), asyncHandler(getMyEvents));
router.get('/:id', asyncHandler(getEvent));
router.post('/', authenticate, authorize('organizer', 'admin'), upload.single('banner_image'), handleValidationErrors, asyncHandler(createEvent));
router.put('/:id', authenticate, isEventOwner, upload.single('banner_image'), handleValidationErrors, asyncHandler(updateEvent));
router.delete('/:id', authenticate, isEventOwner, asyncHandler(deleteEvent));

export default router;
