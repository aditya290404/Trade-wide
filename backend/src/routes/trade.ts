import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res: any) => {
  const { symbol, type, quantity, price } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (quantity <= 0) return res.status(400).json({ error: 'Quantity must be positive' });
  if (type !== 'BUY' && type !== 'SELL') return res.status(400).json({ error: 'Invalid trade type' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const totalValue = quantity * price;

      if (type === 'BUY') {
        if (user.balance < totalValue) {
          throw new Error('Insufficient balance');
        }

        // Deduct balance
        await tx.user.update({
          where: { id: userId },
          data: { balance: user.balance - totalValue }
        });

        // Update or create portfolio
        const portfolio = await tx.portfolio.findUnique({
          where: { userId_symbol: { userId, symbol } }
        });

        if (portfolio) {
          const newQuantity = portfolio.quantity + quantity;
          const newTotalCost = (portfolio.quantity * portfolio.averagePrice) + totalValue;
          await tx.portfolio.update({
            where: { id: portfolio.id },
            data: { 
              quantity: newQuantity,
              averagePrice: newTotalCost / newQuantity
            }
          });
        } else {
          await tx.portfolio.create({
            data: { userId, symbol, quantity, averagePrice: price }
          });
        }
      } else { // SELL
        const portfolio = await tx.portfolio.findUnique({
          where: { userId_symbol: { userId, symbol } }
        });

        if (!portfolio || portfolio.quantity < quantity) {
          throw new Error('Insufficient quantity to sell');
        }

        // Add balance
        await tx.user.update({
          where: { id: userId },
          data: { balance: user.balance + totalValue }
        });

        // Update or delete portfolio
        if (portfolio.quantity === quantity) {
          await tx.portfolio.delete({ where: { id: portfolio.id } });
        } else {
          await tx.portfolio.update({
            where: { id: portfolio.id },
            data: { quantity: portfolio.quantity - quantity }
          });
        }
      }

      // Record trade
      return await tx.trade.create({
        data: { userId, symbol, type, quantity, price }
      });
    });

    res.json({ success: true, trade: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/history', async (req: AuthRequest, res) => {
  const trades = await prisma.trade.findMany({
    where: { userId: req.userId as number },
    orderBy: { timestamp: 'desc' }
  });
  res.json(trades);
});

export default router;
