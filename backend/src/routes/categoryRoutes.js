import express from 'express';
import { getAllCategories } from '../controllers/categoryController.js';
import { asyncHandler } from '../middleware/error.js';

const router = express.Router();
router.get('/', asyncHandler(getAllCategories));
export default router;