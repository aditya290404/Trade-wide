import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { catchAsync } from '../utils/catchAsync';
import { executeBuy, executeSell, getUserTrades } from '../services/trade.service';
import { AuthRequest } from '../middleware/auth';

const tradeSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().int().positive()
});

export const buyStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { symbol, quantity } = tradeSchema.parse(req.body);
  const userId = req.user.id;

  const trade = await executeBuy(userId, symbol, quantity);

  res.status(200).json({
    status: 'success',
    data: { trade }
  });
});

export const sellStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { symbol, quantity } = tradeSchema.parse(req.body);
  const userId = req.user.id;

  const trade = await executeSell(userId, symbol, quantity);

  res.status(200).json({
    status: 'success',
    data: { trade }
  });
});

export const getTrades = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const trades = await getUserTrades(userId);

  res.status(200).json({
    status: 'success',
    results: trades.length,
    data: { trades }
  });
});
