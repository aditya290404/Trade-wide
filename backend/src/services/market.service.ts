import { AppError } from '../utils/AppError';

// A mock service generating random but somewhat stable stock prices
const basePrices: Record<string, number> = {
  'AAPL': 175.50,
  'GOOG': 140.20,
  'MSFT': 330.10,
  'TSLA': 210.80,
  'AMZN': 130.40,
  'META': 315.60,
  'NVDA': 480.00,
  'RELIANCE': 2950.00,
  'INFY': 1450.00,
  'HDFCBANK': 1650.00,
  'TCS': 3800.00,
  'TATAMOTORS': 920.00,
  'IBM': 185.00,
  'NFLX': 600.00
};

const priceCache = new Map<string, { price: number, change: number, timestamp: number }>();

export const getStockPrice = async (symbol: string): Promise<number> => {
  const upperSymbol = symbol.toUpperCase();
  
  // Check cache (TTL 5 seconds for overview to feel real-time)
  const cached = priceCache.get(upperSymbol);
  if (cached && (Date.now() - cached.timestamp < 5000)) {
    return cached.price;
  }

  let basePrice = basePrices[upperSymbol];
  
  if (!basePrice) {
    basePrice = Math.random() * 500 + 50; 
    basePrices[upperSymbol] = basePrice;
  }

  // Add random volatility (+/- 0.5% per tick)
  const volatility = (Math.random() - 0.5) * 0.01;
  const currentPrice = Number((basePrice * (1 + volatility)).toFixed(2));
  
  // Calculate simulated 24h change for the UI (random -5% to +5%)
  const dayChange = Number(((Math.random() - 0.5) * 10).toFixed(2));

  // Update base slightly so it "trends"
  basePrices[upperSymbol] = currentPrice;

  // Cache
  priceCache.set(upperSymbol, { price: currentPrice, change: dayChange, timestamp: Date.now() });

  return currentPrice;
};

export const getMarketOverview = async () => {
  const symbols = ['AAPL', 'GOOG', 'TSLA', 'NVDA', 'RELIANCE', 'INFY', 'MSFT', 'AMZN'];
  
  const overview = await Promise.all(symbols.map(async (symbol) => {
    const price = await getStockPrice(symbol);
    const cached = priceCache.get(symbol);
    return {
      symbol,
      price,
      change: cached?.change || 0
    };
  }));

  return overview;
};
