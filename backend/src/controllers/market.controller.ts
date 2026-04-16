import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { getStockPrice, getMarketOverview } from '../services/market.service';

export const getPrice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { symbol } = req.params;
  
  const price = await getStockPrice(symbol);
  
  res.status(200).json({
    status: 'success',
    data: {
      symbol: symbol.toUpperCase(),
      currentPrice: price,
      timestamp: new Date().toISOString()
    }
  });
});

export const getOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const overview = await getMarketOverview();
  
  res.status(200).json({
    status: 'success',
    data: {
      market: overview,
      timestamp: new Date().toISOString()
    }
  });
});
