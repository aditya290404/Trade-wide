import { Router } from 'express';
import { getPrice, getOverview } from '../controllers/market.controller';

const router = Router();

router.get('/overview', getOverview);
router.get('/:symbol', getPrice);

export default router;
