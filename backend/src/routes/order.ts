import { Router } from 'express';
import { PrismaClient, OrderStatus, OrderType, TradeType } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getCurrentMarketPrices } from '../utils/marketData';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Place a new Order
router.post('/', async (req: AuthRequest, res: any) => {
  const { symbol, type, orderType, targetPrice, quantity, isIntraday = false } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (quantity <= 0) return res.status(400).json({ error: 'Quantity must be positive' });
  if (type !== 'BUY' && type !== 'SELL') return res.status(400).json({ error: 'Invalid trade type' });
  if (!['MARKET', 'LIMIT', 'STOP_LOSS'].includes(orderType)) return res.status(400).json({ error: 'Invalid order type' });
  if (orderType !== 'MARKET' && (!targetPrice || targetPrice <= 0)) {
    return res.status(400).json({ error: 'Target price is required for Limit/Stop orders' });
  }

  const marketPrices = getCurrentMarketPrices();
  const livePrice = marketPrices[symbol];
  if (!livePrice) return res.status(400).json({ error: 'Invalid symbol' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      // For MARKET orders, use live price. For LIMIT, use target price to lock funds.
      const lockPrice = orderType === 'MARKET' ? livePrice : targetPrice;
      const totalValue = quantity * lockPrice;

      if (type === 'BUY') {
        if (user.balance < totalValue) {
          throw new Error('Insufficient balance');
        }

        // Lock balance immediately (deduct)
        await tx.user.update({
          where: { id: userId },
          data: { balance: user.balance - totalValue }
        });
      } else {
        // SELL - Verify holding/position quantity
        if (isIntraday) {
          const position = await tx.position.findUnique({ where: { userId_symbol: { userId, symbol } } });
          if (!position || position.quantity < quantity) throw new Error('Insufficient intraday position to sell');
          
          // Deduct quantity immediately to lock it
          await tx.position.update({
            where: { id: position.id },
            data: { quantity: position.quantity - quantity }
          });
        } else {
          const holding = await tx.holding.findUnique({ where: { userId_symbol: { userId, symbol } } });
          if (!holding || holding.quantity < quantity) throw new Error('Insufficient delivery holding to sell');
          
          // Deduct quantity
          await tx.holding.update({
            where: { id: holding.id },
            data: { quantity: holding.quantity - quantity }
          });
        }
      }

      // Create Order
      const status = orderType === 'MARKET' ? OrderStatus.EXECUTED : OrderStatus.PENDING;
      
      const order = await tx.order.create({
        data: {
          userId,
          symbol,
          type: type as TradeType,
          orderType: orderType as OrderType,
          targetPrice: orderType === 'MARKET' ? null : targetPrice,
          quantity,
          filledQty: orderType === 'MARKET' ? quantity : 0,
          status,
          isIntraday
        }
      });

      // If MARKET, immediately create Trade and resolve Holdings/Positions additions
      if (orderType === 'MARKET') {
        await tx.trade.create({
          data: {
            orderId: order.id,
            userId,
            symbol,
            type: type as TradeType,
            quantity,
            price: livePrice
          }
        });

        if (type === 'BUY') {
          if (isIntraday) {
            const position = await tx.position.findUnique({ where: { userId_symbol: { userId, symbol } } });
            if (position) {
              const newQty = position.quantity + quantity;
              const newTotalCost = (position.quantity * position.averagePrice) + (quantity * livePrice);
              await tx.position.update({
                where: { id: position.id },
                data: { quantity: newQty, averagePrice: newTotalCost / newQty }
              });
            } else {
              await tx.position.create({
                data: { userId, symbol, quantity, averagePrice: livePrice }
              });
            }
          } else {
            const holding = await tx.holding.findUnique({ where: { userId_symbol: { userId, symbol } } });
            if (holding) {
              const newQty = holding.quantity + quantity;
              const newTotalCost = (holding.quantity * holding.averagePrice) + (quantity * livePrice);
              await tx.holding.update({
                where: { id: holding.id },
                data: { quantity: newQty, averagePrice: newTotalCost / newQty }
              });
            } else {
              await tx.holding.create({
                data: { userId, symbol, quantity, averagePrice: livePrice }
              });
            }
          }
        } else {
           // For MARKET SELL, funds are unlocked/added here
           await tx.user.update({
              where: { id: userId },
              data: { balance: user.balance + totalValue } // totalValue here uses lockPrice (livePrice)
           });
           
           // If position/holding reaches 0, clean it up
           if (isIntraday) {
              const position = await tx.position.findUnique({ where: { userId_symbol: { userId, symbol } } });
              if (position && position.quantity === 0) {
                 await tx.position.delete({ where: { id: position.id } });
              }
           } else {
              const holding = await tx.holding.findUnique({ where: { userId_symbol: { userId, symbol } } });
              if (holding && holding.quantity === 0) {
                 await tx.holding.delete({ where: { id: holding.id } });
              }
           }
        }
      }

      return order;
    });

    res.json({ success: true, order: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/history', async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId as number },
    include: { trades: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

router.post('/:id/cancel', async (req: AuthRequest, res: any) => {
  const orderId = parseInt(req.params.id);
  const userId = req.userId as number;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');
      if (order.userId !== userId) throw new Error('Unauthorized');
      if (order.status !== OrderStatus.PENDING) throw new Error('Only pending orders can be cancelled');

      // Refund logic
      if (order.type === 'BUY') {
        const refundAmount = (order.quantity - order.filledQty) * (order.targetPrice || 0);
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: refundAmount } }
        });
      } else {
        // Refund shares
        const refundQty = order.quantity - order.filledQty;
        if (order.isIntraday) {
          await tx.position.update({
            where: { userId_symbol: { userId, symbol: order.symbol } },
            data: { quantity: { increment: refundQty } }
          });
        } else {
          await tx.holding.update({
            where: { userId_symbol: { userId, symbol: order.symbol } },
            data: { quantity: { increment: refundQty } }
          });
        }
      }

      return await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED }
      });
    });

    res.json({ success: true, order: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
