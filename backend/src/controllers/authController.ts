import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../../ormconfig';
import { log } from 'console';

const ACCESS_TOKEN_SECRET = 'your_access_token_secret';
const REFRESH_TOKEN_SECRET = 'your_refresh_token_secret';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body)
  const { mail, password } = req.body;

  try {
    // Kullanıcıyı veritabanından bulma
    // const user = await AppDataSource.getRepository(User).findOneBy({ mail });
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    const user: User = await queryBuilder.where("usr.mail = :body_mail", {body_mail: mail}).getOne();
    log(user);
    
    if (!user) {
      res.status(401).json({ message: 'Geçersiz mail veya şifre' });
      return;
    }

    const isPasswordValid = (password === user.password)
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Geçersiz mail veya şifre' });
      return;
    }
    // Access ve Refresh Token oluşturma
    const accessToken = jwt.sign({ 
      id: user.id,
      username: user.full_name,
      role: user.role
    }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({
      id: user.id,
      username: user.full_name,
      role: user.role
    },REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    console.log(accessToken);
    res.json({ accessToken, refreshToken });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};
