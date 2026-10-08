import { Router } from 'express';
import { getInsights } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/insights', getInsights);

export default router;
