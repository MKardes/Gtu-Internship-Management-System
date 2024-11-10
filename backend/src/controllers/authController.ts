import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../../ormconfig';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config';
import { VerifCode } from '../entities/verifcode.entity';
import { LocalStorage } from 'node-localstorage';


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

    const isPasswordValid = (password === user.password)
    // const isPasswordValid = await bcrypt.compare(password, user.password);
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

export const sendCode = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // Fetch user from database based on email
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    const user: User = await queryBuilder.where("usr.mail = :body_mail", { body_mail: email }).getOne();

    // If user not found, send a 404 error
    if (!user) {
      res.status(404).json({ message: 'Geçersiz mail' });
      return;
    }

    // Generate a random 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Set up nodemailer transporter with environment variables for security
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email (use environment variables)
        pass: process.env.EMAIL_PASS, // Your email password (use environment variables)
      },
    });

    // Send the email with the verification code
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Use environment variable
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    });

    // Save the code and expiration time in the database
    const queryBuilder2 = AppDataSource.getRepository(VerifCode).createQueryBuilder("verifcode");
    await queryBuilder2.insert().values({
      code: verificationCode,
      mail: email,
      isActive: true,
      expire_date: expirationTime,
    }).execute();

    // Respond with a success message
    res.status(200).json({ message: 'Verification code sent successfully!' });
  } catch (error) {
    // Catch and return any errors
    console.error(error);
    res.status(500).json({ message: 'An error occurred while sending the verification code', error: error });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  const { code , mail} = req.body;

  try {
    // Fetch the verification code from the database
    const queryBuilder = AppDataSource.getRepository(VerifCode).createQueryBuilder("verifcode");
    const verificationCode: VerifCode = await queryBuilder.where("verifcode.mail = :body_mail", { body_mail: mail }).getOne();

    // If no code is found, return a 404 error
    if (!verificationCode) {
      res.status(404).json({ message: 'Verification code is not valid' });
      return;
    }

    if (verificationCode.code !== code) {
      res.status(401).json({ message: 'Verification code is not correct' });
      return;
    }

    // If the code is expired, return a 401 error
    if (verificationCode.expire_date < new Date() || !verificationCode.isActive) {
      res.status(401).json({ message: 'Verification code has expired' });
      return;
    }


    verificationCode.isActive = false;
    // If everything is correct, return a success message
    res.status(200).json({ message: 'Verification code is correct!' });
  } catch (error) {
    // Catch and return any errors
    console.error(error);
    res.status(500).json({ message: 'An error occurred while verifying the code', error: error });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { password, mail } = req.body;

  try {
    const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
    const user: User = await queryBuilder.where("usr.mail = :body_mail", { body_mail: mail }).getOne();

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.password = password;
    await queryBuilder.update().set({ password: password }).where("id = :id", { id: user.id }).execute();

    res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while changing the password', error: error });
  }
}