import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorMiddleware } from './middleware/error';
import { metricsMiddleware, getMetrics } from './middleware/metrics';
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';
import marketRoutes from './routes/market.routes';
import tradeRoutes from './routes/trade.routes';
import cloudRoutes from './routes/cloud.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

app.use(metricsMiddleware);
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Trade Wide Backend is running' });
});

app.get('/metrics', getMetrics);

// Routes
app.use('/auth', authRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/market', marketRoutes);
app.use('/trade', tradeRoutes);
app.use('/cloud', cloudRoutes);
app.use('/ai', aiRoutes);

// Unhandled Route
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global Error Handler
app.use(errorMiddleware as express.ErrorRequestHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
