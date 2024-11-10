import express from 'express';
import { loginUser } from '../controllers/authController';
import { verifyToken } from '../middlewares/verifyToken';
import { sendCode } from '../controllers/authController';
import { verifyCode } from '../controllers/authController';
import { changePassword } from '../controllers/authController';

const authRouter = express.Router();

// Kullanıcı giriş işlemi
authRouter.post('/login', loginUser);
authRouter.post('/send-code', sendCode);

authRouter.post('/verify-code', verifyCode);

authRouter.post('/change-password', changePassword);

// Token doğrulaması için /me endpointi
authRouter.get('/me', verifyToken, (req: any, res) => {
  res.status(200).json({ user: req.user });  // Kullanıcı bilgilerini döndür
});

export default authRouter;
