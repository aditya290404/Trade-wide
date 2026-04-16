import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { getUserPortfolio } from '../services/portfolio.service';
import { AuthRequest } from '../middleware/auth';

export const getPortfolio = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const portfolio = await getUserPortfolio(userId);

  res.status(200).json({
    status: 'success',
    data: { portfolio }
  });
});
