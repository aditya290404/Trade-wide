import { Router } from 'express';
import { buyStock, sellStock, getTrades } from '../controllers/trade.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Protect all trade routes
router.use(protect);

router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.get('/', getTrades);

export default router;
