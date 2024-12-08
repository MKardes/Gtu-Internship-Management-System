import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../../ormconfig';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config';
import bcrypt from 'bcrypt';
import Logger from '../utils/Logger';

const logger = new Logger('auth.log')

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { mail, password } = req.body;
  try {
    logger.log(`Login attempt: ${mail}`);

    // Kullanıcıyı veritabanından bulma
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    const user: User = await queryBuilder.where("usr.mail = :body_mail", {body_mail: mail}).getOne();
    
    if (!user) {
      logger.log(`Login failed: ${mail} - User not found`);
      res.status(401).json({ message: 'Geçersiz mail veya şifre' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.log(`Login failed: ${mail} - Invalid password`);
      res.status(401).json({ message: 'Geçersiz mail veya şifre' });
      return;
    }
    // Access ve Refresh Token oluşturma
    const accessToken = jwt.sign(
      { id: user.id, username: user.full_name, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      {id: user.id, username: user.full_name, role: user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Refresh token'ı veritabanına kaydetme (isteğe bağlı)
    await queryBuilder.update().set({ refreshToken }).where("id = :id", { id: user.id }).execute();

    logger.log(`Login successful: ${mail}`);
    res.json({ accessToken, refreshToken });
    return;
  } catch (error) {
    logger.log(`Login error: ${mail} - ${error}`);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body;
  try {
    logger.log(`Logout attempt: User ID ${id}`);
    // Refresh token'ı veritabanından silme
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    await queryBuilder.update().set({ refreshToken: null }).where("id = :id", { id }).execute();
    logger.log(`Logout successful: User ID ${id}`);
    res.json({ message: 'Çıkış yapıldı' });
  } catch (error) {
    logger.log(`Logout error: User ID ${id} - ${error}`);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
}