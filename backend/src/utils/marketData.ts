export const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 175.5 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 140.2 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 410.0 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 178.1 },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 195.3 },
];

export const getLivePrice = (basePrice: number) => {
  const dateSeed = new Date().getMinutes();
  const fluctuation = (Math.sin(dateSeed) * 5) + (Math.random() * 4 - 2);
  return Number((basePrice + fluctuation).toFixed(2));
};

export const getCurrentMarketPrices = () => {
  return STOCKS.reduce((acc, stock) => {
    acc[stock.symbol] = getLivePrice(stock.basePrice);
    return acc;
  }, {} as Record<string, number>);
};
