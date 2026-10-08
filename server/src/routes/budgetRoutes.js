import { Router } from 'express';
import { listBudgets, getBudget, setBudget, deleteBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listBudgets);
router.route('/:month').get(getBudget).put(setBudget).delete(deleteBudget);

export default router;
