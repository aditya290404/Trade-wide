import { Server, Socket } from 'socket.io';
import { STOCKS, getLivePrice } from './utils/marketData';
import { PrismaClient, OrderStatus, TradeType, OrderType } from '@prisma/client';

const prisma = new PrismaClient();

// The Matching Engine
const runMatchingEngine = async (marketData: any[]) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: { status: OrderStatus.PENDING }
    });

    for (const order of pendingOrders) {
      const stock = marketData.find(s => s.symbol === order.symbol);
      if (!stock) continue;

      const livePrice = stock.currentPrice;
      let shouldExecute = false;

      // Limit Buy: Execute if price falls to or below target
      if (order.type === 'BUY' && order.orderType === 'LIMIT' && livePrice <= (order.targetPrice || 0)) {
        shouldExecute = true;
      }
      // Limit Sell: Execute if price rises to or above target
      else if (order.type === 'SELL' && order.orderType === 'LIMIT' && livePrice >= (order.targetPrice || 0)) {
        shouldExecute = true;
      }
      // Stop Loss Sell: Execute if price falls to or below target (Stop Trigger)
      else if (order.type === 'SELL' && order.orderType === 'STOP_LOSS' && livePrice <= (order.targetPrice || 0)) {
        shouldExecute = true;
      }

      if (shouldExecute) {
        await prisma.$transaction(async (tx) => {
          // Double check order is still pending to prevent race conditions
          const currentOrder = await tx.order.findUnique({ where: { id: order.id } });
          if (!currentOrder || currentOrder.status !== OrderStatus.PENDING) return;

          // 1. Create Trade record
          await tx.trade.create({
            data: {
              orderId: order.id,
              userId: order.userId,
              symbol: order.symbol,
              type: order.type,
              quantity: order.quantity,
              price: livePrice
            }
          });

          // 2. Mark order as executed
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.EXECUTED, filledQty: order.quantity }
          });

          // 3. Update holdings/positions and balance differentials
          if (order.type === 'BUY') {
            // Funds were already locked at targetPrice when order was placed.
            // If livePrice < targetPrice, we should refund the difference!
            const targetTotal = order.quantity * (order.targetPrice || 0);
            const actualTotal = order.quantity * livePrice;
            const refund = targetTotal - actualTotal;

            if (refund > 0) {
              await tx.user.update({
                where: { id: order.userId },
                data: { balance: { increment: refund } }
              });
            }

            if (order.isIntraday) {
              const pos = await tx.position.findUnique({ where: { userId_symbol: { userId: order.userId, symbol: order.symbol } } });
              if (pos) {
                const newQty = pos.quantity + order.quantity;
                const newTotalCost = (pos.quantity * pos.averagePrice) + actualTotal;
                await tx.position.update({
                  where: { id: pos.id },
                  data: { quantity: newQty, averagePrice: newTotalCost / newQty }
                });
              } else {
                await tx.position.create({
                  data: { userId: order.userId, symbol: order.symbol, quantity: order.quantity, averagePrice: livePrice }
                });
              }
            } else {
              const hold = await tx.holding.findUnique({ where: { userId_symbol: { userId: order.userId, symbol: order.symbol } } });
              if (hold) {
                const newQty = hold.quantity + order.quantity;
                const newTotalCost = (hold.quantity * hold.averagePrice) + actualTotal;
                await tx.holding.update({
                  where: { id: hold.id },
                  data: { quantity: newQty, averagePrice: newTotalCost / newQty }
                });
              } else {
                await tx.holding.create({
                  data: { userId: order.userId, symbol: order.symbol, quantity: order.quantity, averagePrice: livePrice }
                });
              }
            }
          } else {
            // SELL order: Stock quantity was already locked when order was placed.
            // We just need to add the sale proceeds to user balance.
            const proceeds = order.quantity * livePrice;
            await tx.user.update({
              where: { id: order.userId },
              data: { balance: { increment: proceeds } }
            });
            
            // Clean up 0 quantity holdings if needed
            if (order.isIntraday) {
               const pos = await tx.position.findUnique({ where: { userId_symbol: { userId: order.userId, symbol: order.symbol } } });
               if (pos && pos.quantity === 0) await tx.position.delete({ where: { id: pos.id } });
            } else {
               const hold = await tx.holding.findUnique({ where: { userId_symbol: { userId: order.userId, symbol: order.symbol } } });
               if (hold && hold.quantity === 0) await tx.holding.delete({ where: { id: hold.id } });
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Matching engine error:', error);
  }
};

const runSquareOffEngine = async (marketData: any[]) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const expiredPositions = await prisma.position.findMany({
      where: { createdAt: { lt: oneHourAgo } }
    });

    for (const pos of expiredPositions) {
      if (pos.quantity === 0) continue;
      const stock = marketData.find(s => s.symbol === pos.symbol);
      if (!stock) continue;

      const livePrice = stock.currentPrice;
      const proceeds = pos.quantity * livePrice;

      await prisma.$transaction(async (tx) => {
        // Double check
        const currentPos = await tx.position.findUnique({ where: { id: pos.id } });
        if (!currentPos || currentPos.quantity === 0) return;

        // Sell the position
        await tx.user.update({
          where: { id: pos.userId },
          data: { balance: { increment: proceeds } }
        });

        // Record a trade
        await tx.trade.create({
          data: {
            orderId: 0, // Mock ID or we can make orderId optional for system trades. Wait, orderId is required. 
            // Wait, I cannot create a Trade without an Order. I will create a system Order first.
            order: {
              create: {
                userId: pos.userId,
                symbol: pos.symbol,
                type: TradeType.SELL,
                orderType: OrderType.MARKET,
                quantity: pos.quantity,
                filledQty: pos.quantity,
                status: OrderStatus.EXECUTED,
                isIntraday: true
              }
            },
            userId: pos.userId,
            symbol: pos.symbol,
            type: TradeType.SELL,
            quantity: pos.quantity,
            price: livePrice
          }
        });

        // Delete the position
        await tx.position.delete({ where: { id: pos.id } });
      });
    }
  } catch (error) {
    console.error('Square-off engine error:', error);
  }
};

export const initSocket = (io: Server) => {
  console.log('Socket.io initialized');

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Broadcast market prices every 3 seconds & run matching engine
  setInterval(async () => {
    const marketData = STOCKS.map(s => {
      const currentPrice = getLivePrice(s.basePrice);
      if (typeof currentPrice !== 'number' || isNaN(currentPrice)) return null;
      return {
        ...s,
        currentPrice,
        change: Number((currentPrice - s.basePrice).toFixed(2))
      };
    }).filter(Boolean);

    if (marketData.length > 0) {
      io.emit('market-update', marketData);
      
      // Run engines async
      runMatchingEngine(marketData).catch(console.error);
      runSquareOffEngine(marketData).catch(console.error);
    }
  }, 3000);
};

