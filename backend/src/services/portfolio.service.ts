import prisma from '../config/db';
import { getStockPrice } from './market.service';

export const getUserPortfolio = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const holdings = await prisma.holding.findMany({ where: { userId } });

  let totalInvestment = 0;
  let currentValue = 0;

  const enrichedHoldings = await Promise.all(
    holdings.map(async (holding) => {
      const currentPrice = await getStockPrice(holding.symbol);
      const investment = holding.quantity * holding.avgPrice;
      const value = holding.quantity * currentPrice;
      const profitLoss = value - investment;
      const profitLossPercentage = investment > 0 ? (profitLoss / investment) * 100 : 0;

      totalInvestment += investment;
      currentValue += value;

      return {
        ...holding,
        currentPrice,
        investment,
        currentValue: value,
        profitLoss,
        profitLossPercentage
      };
    })
  );

  const totalProfitLoss = currentValue - totalInvestment;
  const portfolioSummary = {
    balance: user?.balance || 0,
    totalInvestment,
    currentValue,
    totalProfitLoss,
    holdings: enrichedHoldings
  };

  return portfolioSummary;
};
