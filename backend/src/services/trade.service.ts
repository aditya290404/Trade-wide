import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { getStockPrice } from './market.service';

export const executeBuy = async (userId: number, symbol: string, quantity: number) => {
  const upperSymbol = symbol.toUpperCase();
  const currentPrice = await getStockPrice(upperSymbol);
  const totalCost = currentPrice * quantity;

  // Use Prisma interactive transaction to prevent race conditions during concurrent requests
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    if (user.balance < totalCost) {
      throw new AppError('Insufficient funds', 400);
    }

    // Deduct balance
    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: totalCost } },
    });

    // Add or update holding
    const existingHolding = await tx.holding.findUnique({
      where: { userId_symbol: { userId, symbol: upperSymbol } }
    });

    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity;
      const newTotalValue = (existingHolding.quantity * existingHolding.avgPrice) + totalCost;
      const newAvgPrice = newTotalValue / newQuantity;

      await tx.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: newQuantity,
          avgPrice: newAvgPrice
        }
      });
    } else {
      await tx.holding.create({
        data: {
          userId,
          symbol: upperSymbol,
          quantity,
          avgPrice: currentPrice
        }
      });
    }

    // Create trade record
    const trade = await tx.trade.create({
      data: {
        userId,
        symbol: upperSymbol,
        type: 'BUY',
        price: currentPrice,
        quantity
      }
    });

    return trade;
  });
};

export const executeSell = async (userId: number, symbol: string, quantity: number) => {
  const upperSymbol = symbol.toUpperCase();
  
  return await prisma.$transaction(async (tx) => {
    const holding = await tx.holding.findUnique({
      where: { userId_symbol: { userId, symbol: upperSymbol } }
    });

    if (!holding || holding.quantity < quantity) {
      throw new AppError('Insufficient shares to sell', 400);
    }

    const currentPrice = await getStockPrice(upperSymbol);
    const totalRevenue = currentPrice * quantity;

    // Add balance
    await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: totalRevenue } }
    });

    // Update or remove holding
    if (holding.quantity === quantity) {
      await tx.holding.delete({ where: { id: holding.id } });
    } else {
      await tx.holding.update({
        where: { id: holding.id },
        data: { quantity: { decrement: quantity } }
      });
    }

    // Create trade record
    const trade = await tx.trade.create({
      data: {
        userId,
        symbol: upperSymbol,
        type: 'SELL',
        price: currentPrice,
        quantity
      }
    });

    return trade;
  });
};

export const getUserTrades = async (userId: number) => {
  return await prisma.trade.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' }
  });
};
