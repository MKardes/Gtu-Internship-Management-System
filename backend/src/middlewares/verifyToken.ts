// middlewares/verifyToken.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = 'your_access_token_secret';

export const verifyToken = (req: Request, res: Response, next: NextFunction):Promise<void> => {
  const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>' formatında token alınır

  if (!token) {
    res.status(401).json({ message: 'Yetkisiz erişim' });
    return; 
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.body = decoded;  // Kullanıcı bilgilerini isteğe ekleyin
    console.log("body bulundu");
    console.log(req.body);
    next();  // İstek doğrulandı, bir sonraki middleware'e veya route'a geç
  } catch (error) {
    res.status(403).json({ message: 'Token geçersiz' });
  }
};
