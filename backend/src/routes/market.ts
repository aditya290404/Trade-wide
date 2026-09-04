import { Router } from 'express';

const router = Router();

// Mock stock data generator
const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 175.5 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 140.2 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 410.0 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 178.1 },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 195.3 },
];

// Generate somewhat realistic randomized prices based on a seed or time
const getLivePrice = (basePrice: number) => {
  const dateSeed = new Date().getMinutes();
  const fluctuation = (Math.sin(dateSeed) * 5) + (Math.random() * 2 - 1);
  return Number((basePrice + fluctuation).toFixed(2));
};

router.get('/', (req, res) => {
  const q = req.query.q as string;
  
  let results = STOCKS.map(s => ({
    ...s,
    currentPrice: getLivePrice(s.basePrice),
    change: Number((getLivePrice(s.basePrice) - s.basePrice).toFixed(2))
  }));

  if (q) {
    results = results.filter(s => s.symbol.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase()));
  }

  res.json(results);
});

router.get('/:symbol/chart', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = STOCKS.find(s => s.symbol === symbol);
  
  if (!stock) return res.status(404).json({ error: 'Stock not found' });

  // Generate 20 mock data points for a chart
  const data = [];
  let currentPrice = stock.basePrice;
  for (let i = 20; i >= 0; i--) {
    currentPrice = currentPrice + (Math.random() * 4 - 2);
    data.push({
      time: new Date(Date.now() - i * 60000).toISOString(),
      price: Number(currentPrice.toFixed(2))
    });
  }

  res.json({ symbol: stock.symbol, name: stock.name, chart: data });
});

export default router;
