import express from 'express';
import { loginUser } from '../controllers/authController';
import { logoutUser } from '../controllers/authController';
import { verifyToken } from '../middlewares/verifyToken';
import resetPasswordController from '../controllers/resetPasswordController';

const authRouter = express.Router();

// Kullanıcı giriş işlemi
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);

authRouter.post('/send-code', resetPasswordController.sendCode);
authRouter.post('/verify-code', resetPasswordController.verifyCode);
authRouter.post('/change-password', resetPasswordController.changePassword);

// Token doğrulaması için /me endpointi
authRouter.get('/me', verifyToken, (req: any, res) => {
  res.status(200).json({ user: req.user });
});

export default authRouter;
