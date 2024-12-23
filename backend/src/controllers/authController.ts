import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../../ormconfig';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config';
import bcrypt from 'bcrypt';
import Logger from '../utils/Logger';
import { logRequest } from '../utils/ResponseHandler';

const logger = new Logger('response.log')

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { mail, password } = req.body;
  try {
    logger.log(`Login attempt: ${mail}`);

    // Kullanıcıyı veritabanından bulma
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    const user: User = await queryBuilder.where("usr.mail = :body_mail", {body_mail: mail}).getOne();
    
    if (!user) {
      logger.log(`Login failed: ${mail} - User not found`);
      logRequest(res, { status: 401, data: { message: 'Geçersiz mail veya şifre' } }, `POST /login`, req); // logRequest ile loglama ve response
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.log(`Login failed: ${mail} - Invalid password`);
      logRequest(res, { status: 401, data: { message: 'Geçersiz mail veya şifre' } }, `POST /login`, req); // logRequest ile loglama ve response
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
    logRequest(res, { status: 200, data: { accessToken, refreshToken } }, `POST /login`, req); // logRequest ile loglama ve response
    return;
  } catch (error) {
    logger.log(`Login error: ${mail} - ${error}`);
    logRequest(res, { status: 500, data: { message: 'Sunucu hatası', error } }, `POST /login`, req); // logRequest ile loglama ve response
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
    logRequest(res, { status: 200, data: { message: 'Çıkış yapıldı' } }, `POST /logout`, req); // logRequest ile loglama ve response
  } catch (error) {
    logger.log(`Logout error: User ID ${id} - ${error}`);
    logRequest(res, { status: 500, data: { message: 'Sunucu hatası', error } }, `POST /logout`, req); // logRequest ile loglama ve response
  }
}