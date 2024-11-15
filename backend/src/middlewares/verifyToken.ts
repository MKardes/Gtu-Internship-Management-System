// middlewares/verifyToken.ts
import { Request, Response, NextFunction } from 'express';
import { ACCESS_TOKEN_SECRET } from '../config';
import jwt from 'jsonwebtoken';

interface MyRequest extends Request {
  user: any;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction):Promise<void> => {
  const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>' formatında token alınır

  if (!token) {
    res.status(401).json({ message: 'Yetkisiz erişimm' });
    return; 
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    let myRequest: MyRequest = req as MyRequest;
    myRequest.user = decoded;  // Kullanıcı bilgilerini isteğe ekleyin
    next();  // İstek doğrulandı, bir sonraki middleware'e veya route'a geç
  } catch (error) {
    res.status(403).json({ message: 'Token geçersiz' });
  }
};
