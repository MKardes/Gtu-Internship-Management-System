// controllers/refreshTokenController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../../ormconfig';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config';
import { logRequest } from '../utils/ResponseHandler';


export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logRequest(res, { status: 402, data: { message: 'Refresh token gerekli' } }, 'POST /refresh-token');
    return;
  }

  try {
    // Refresh token doğrulama
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
    
    // decoded.id kontrolü
    if (!decoded.id) {
      logRequest(res, { status: 402, data: { message: 'Geçersiz token verisi' } }, 'POST /refresh-token');
      return;
    }

    // Kullanıcıyı veritabanından bulma
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    const user: User = await queryBuilder.where("usr.id = :id", { id: decoded.id })
                                          .andWhere("usr.refreshToken = :refreshToken", { refreshToken })
                                          .getOne();

    if (!user) {
      logRequest(res, { status: 402, data: { message: 'Geçersiz refresh token' } }, 'POST /refresh-token');
      return;
    }

    // Yeni access token oluşturma
    const newAccessToken = jwt.sign(
      { id: user.id, username: user.full_name, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    logRequest(res, { status: 200, data: { accessToken: newAccessToken } }, 'POST /refresh-token');
  } catch (error) {
    logRequest(res, { status: 402, data: { message: 'Token geçersiz veya süresi dolmuş', error } }, 'POST /refresh-token');
  }
};
