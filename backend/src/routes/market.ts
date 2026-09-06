import { Router } from 'express';
import { STOCKS, getLivePrice } from '../utils/marketData';

const router = Router();

router.get('/', (req, res) => {
  const q = req.query.q as string;
  
  let results = STOCKS.map(s => {
    const currentPrice = getLivePrice(s.basePrice);
    return {
      ...s,
      currentPrice,
      change: Number((currentPrice - s.basePrice).toFixed(2))
    };
  });

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
