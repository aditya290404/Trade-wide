import express from 'express';
import { getMarketSentiment } from '../services/ai.service';

const router = express.Router();

router.get('/analyze/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    if (!ticker) {
      return res.status(400).json({ status: 'error', message: 'Ticker is required' });
    }

    const sentiment = await getMarketSentiment(ticker.toUpperCase());

    res.status(200).json({
      status: 'success',
      data: sentiment
    });
  } catch (error) {
    console.error('AI Route Error:', error);
    res.status(500).json({ status: 'error', message: 'AI Analysis Failed' });
  }
});

export default router;
