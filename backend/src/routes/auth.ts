import express from 'express';
import { loginUser } from '../controllers/authController';
import { verifyToken } from '../middlewares/verifyToken';

const authRouter = express.Router();

// Kullanıcı giriş işlemi
authRouter.post('/login', loginUser);

// Token doğrulaması için /me endpointi
authRouter.get('/me', verifyToken, (req: any, res) => {
  res.status(200).json({ user: req.user });  // Kullanıcı bilgilerini döndür
});

export default authRouter;
