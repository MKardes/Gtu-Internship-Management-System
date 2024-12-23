import { AppDataSource } from "../../ormconfig";
import { User } from "../entities/user.entity";
import { VerifCode } from "../entities/verifcode.entity";
import crypto from "crypto";
import bcrypt from "bcrypt";
import utilService from "../services/utilService";
import nodemailer from "nodemailer";

export class resetPasswordService {
    
    async sendCode(email: string) {
        try {
            const queryBuilder = AppDataSource.getRepository(User).createQueryBuilder("usr");
            const user: User = await queryBuilder.where("usr.mail = :body_mail", { body_mail: email }).getOne();
        
            if (!user) {
                return { status: 404, data: { message: 'Geçersiz mail' } };
            }

            const verificationCode = crypto.randomInt(100000, 999999).toString();
            const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });
        
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: 'Verification Code',
              text: `Your verification code is: ${verificationCode}`,
            });
        
            const queryBuilder2 = AppDataSource.getRepository(VerifCode).createQueryBuilder("verifcode");
            queryBuilder2.delete().where("verifcode.mail = :body_mail", { body_mail: email }).execute();
        
            const verifcodeRepo = AppDataSource.getRepository(VerifCode)
            const newVerifCode = new VerifCode();
            newVerifCode.code = verificationCode;
            newVerifCode.mail = email;
            newVerifCode.expire_date = expirationTime;
            await verifcodeRepo.save(newVerifCode);
        
            return { status: 200, data: { message: 'Verification code sent successfully!' } };
          }
        catch (error) {
            console.error(error);
            return { status: 500, data: { message: 'An error occurred while sending the verification code', error: error } };
        }
    };

    async verifyCode(code: string, email: string) {
        try {
            const queryBuilder = AppDataSource.getRepository(VerifCode).createQueryBuilder("verifcode");
            const verificationCode: VerifCode = await queryBuilder
            .where("verifcode.mail = :body_mail", { body_mail: email })
            .getOne();
        
            if (!verificationCode) {
                return { status: 404, data: { message: 'Geçersiz mail' } };
            }
        
            if (verificationCode.code !== code) {
                return { status: 400, data: { message: 'Geçersiz kod' } };
            }
        
            if (verificationCode.expire_date < new Date()) {
                return { status: 400, data: { message: 'Kodun süresi doldu' } };
            }
        
            return { status: 200, data: { message: 'Verification code is valid' } };
        }
        catch (error) {
            console.error(error);
            return { status: 500, data: { message: 'An error occurred while verifying the code', error: error } };
        }
    };

    async changePassword(email: string, password: string) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user: User = await userRepository.findOne({ where: { mail: email } });
        
            if (!user) {
                return { status: 404, data: { message: 'Geçersiz mail' } };
            }
        
            if (!utilService.isValidPassword(password)) {
                return { status: 400, data: { message: 'Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir' } };
            }
        
            user.password = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
            await userRepository.save(user);
        
            return { status: 200, data: { message: 'Şifre başarıyla değiştirildi' } };
        }
        catch (error) {
            console.error(error);
            return { status: 500, data: { message: 'An error occurred while changing the password', error: error } };
        }
    }
}

export default resetPasswordService;