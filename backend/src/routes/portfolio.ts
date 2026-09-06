import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getCurrentMarketPrices } from '../utils/marketData';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const holdings = await prisma.holding.findMany({ where: { userId: req.userId } });
    const positions = await prisma.position.findMany({ where: { userId: req.userId } });
    const user = await prisma.user.findUnique({ where: { id: req.userId }});
    
    const marketPrices = getCurrentMarketPrices();
    
    const evaluate = (items: any[]) => items.map(item => {
      const currentPrice = marketPrices[item.symbol] || item.averagePrice; 
      const totalValue = currentPrice * item.quantity;
      const investedValue = item.averagePrice * item.quantity;
      const profitLoss = totalValue - investedValue;
      
      return {
        ...item,
        currentPrice,
        totalValue: Number(totalValue.toFixed(2)),
        investedValue: Number(investedValue.toFixed(2)),
        profitLoss: Number(profitLoss.toFixed(2)),
        profitLossPercentage: Number(((profitLoss / investedValue) * 100).toFixed(2))
      };
    });

    const evaluatedHoldings = evaluate(holdings);
    const evaluatedPositions = evaluate(positions);

    const totalHoldingsValue = evaluatedHoldings.reduce((sum, item) => sum + item.totalValue, 0);
    const totalPositionsValue = evaluatedPositions.reduce((sum, item) => sum + item.totalValue, 0);

    res.json({
      balance: user?.balance || 0,
      holdings: evaluatedHoldings,
      positions: evaluatedPositions,
      totalPortfolioValue: totalHoldingsValue + totalPositionsValue
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

router.get('/history', async (req: AuthRequest, res) => {
  try {
    const history = await prisma.portfolioHistory.findMany({
      where: { userId: req.userId },
      orderBy: { timestamp: 'asc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
