// routes/refreshToken.ts
import { Router } from 'express';
import { refreshTokenController } from '../controllers/refreshTokenController';

const router = Router();

// Refresh token kullanarak yeni access token almak için route
router.post('/refresh-token', refreshTokenController);

export default router;
