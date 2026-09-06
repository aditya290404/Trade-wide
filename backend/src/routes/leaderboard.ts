import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import redisClient from '../redisClient';
import { getCurrentMarketPrices } from '../utils/marketData';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // 1. Check Redis Cache
    const cachedLeaderboard = await redisClient.get('leaderboard:cache');
    if (cachedLeaderboard) {
      return res.json({ source: 'cache', data: JSON.parse(cachedLeaderboard) });
    }

    // 2. Cache Miss - Calculate Leaderboard
    const users = await prisma.user.findMany({
      include: {
        portfolio: true
      }
    });

    const marketPrices = getCurrentMarketPrices();

    const leaderboard = users.map(user => {
      let totalPortfolioValue = 0;
      user.portfolio.forEach(item => {
        const currentPrice = marketPrices[item.symbol] || 0;
        totalPortfolioValue += (currentPrice * item.quantity);
      });

      const totalValue = user.balance + totalPortfolioValue;

      return {
        id: user.id,
        email: user.email,
        balance: user.balance,
        portfolioValue: totalPortfolioValue,
        totalValue: Number(totalValue.toFixed(2))
      };
    });

    // 3. Sort Descending by Total Value
    leaderboard.sort((a, b) => b.totalValue - a.totalValue);

    // 4. Set Cache for 60 seconds
    await redisClient.setEx('leaderboard:cache', 60, JSON.stringify(leaderboard));

    res.json({ source: 'database', data: leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
