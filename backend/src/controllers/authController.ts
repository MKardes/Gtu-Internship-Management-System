import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../../ormconfig';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config';
import bcrypt from 'bcrypt';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { mail, password } = req.body;
  try {
    // Kullanıcıyı veritabanından bulma
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    const user: User = await queryBuilder.where("usr.mail = :body_mail", {body_mail: mail}).getOne();
    
    if (!user) {
      res.status(401).json({ message: 'Geçersiz mail veya şifre' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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

    res.json({ accessToken, refreshToken });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body;
  try {
    // Refresh token'ı veritabanından silme
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    await queryBuilder.update().set({ refreshToken: null }).where("id = :id", { id }).execute();
    res.json({ message: 'Çıkış yapıldı' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
}