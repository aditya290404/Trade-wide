import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const portfolio = await prisma.portfolio.findMany({
      where: { userId: req.userId }
    });

    const user = await prisma.user.findUnique({ where: { id: req.userId }});
    
    // In a real app, we would fetch live market prices for these symbols to evaluate current value
    const evaluatedPortfolio = portfolio.map(item => {
      // simulate 2% fluctuation as current price
      const currentPrice = Number((item.averagePrice * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2)); 
      const totalValue = currentPrice * item.quantity;
      const profitLoss = totalValue - (item.averagePrice * item.quantity);
      
      return {
        ...item,
        currentPrice,
        totalValue: Number(totalValue.toFixed(2)),
        profitLoss: Number(profitLoss.toFixed(2)),
        profitLossPercentage: Number(((profitLoss / (item.averagePrice * item.quantity)) * 100).toFixed(2))
      };
    });

    res.json({
      balance: user?.balance || 0,
      holdings: evaluatedPortfolio,
      totalPortfolioValue: evaluatedPortfolio.reduce((sum, item) => sum + item.totalValue, 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

export default router;
