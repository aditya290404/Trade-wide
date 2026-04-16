import { Router } from 'express';
import { getPortfolio } from '../controllers/portfolio.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Require auth
router.use(protect);

router.get('/', getPortfolio);

export default router;
