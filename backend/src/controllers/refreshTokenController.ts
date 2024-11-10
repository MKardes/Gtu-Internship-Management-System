// controllers/refreshTokenController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../../ormconfig';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config';

export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(402).json({ message: 'Refresh token gerekli' });
    return;
  }

  try {
    // Refresh token doğrulama
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
    
    // decoded.id kontrolü
    if (!decoded.id) {
      res.status(402).json({ message: 'Geçersiz token verisi' });
      return;
    }

    // Kullanıcıyı veritabanından bulma
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    const user: User = await queryBuilder.where("usr.id = :id", { id: decoded.id })
                                          .andWhere("usr.refreshToken = :refreshToken", { refreshToken })
                                          .getOne();

    if (!user) {
      res.status(402).json({ message: 'Geçersiz refresh token' });
      return;
    }

    // Yeni access token oluşturma
    const newAccessToken = jwt.sign(
      { id: user.id, username: user.full_name, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(402).json({ message: 'Token geçersiz veya süresi dolmuş' });
  }
};
