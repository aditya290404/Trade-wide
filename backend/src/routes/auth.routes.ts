import { Router } from 'express';
import { register, login, verifyOtp, resendOtp, getMe, updateMe, deleteMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.delete('/me', deleteMe);

export default router;
