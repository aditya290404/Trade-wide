import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretpapertradingkey';

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });

    // Seed 30 days of simulated Portfolio History (Random Walk ending at starting balance)
    const historyData = [];
    const now = new Date();
    let currentVal = user.balance;
    
    // Generate backwards
    for (let i = 0; i <= 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      historyData.push({
        userId: user.id,
        totalValue: Number(currentVal.toFixed(2)),
        timestamp: date
      });
      // Previous day = currentVal / (1 + random return between -2% and 2%)
      const dailyReturn = (Math.random() * 0.04) - 0.02;
      currentVal = currentVal / (1 + dailyReturn);
    }

    // Reverse to chronological order and insert
    await prisma.portfolioHistory.createMany({
      data: historyData.reverse()
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ email: user.email, balance: user.balance });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
