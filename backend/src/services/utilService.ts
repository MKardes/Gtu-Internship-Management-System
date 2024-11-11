import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/user.entity';

export class utilService
{
    static checkPassword(password: string) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    static checkMail(mail: string) {
        const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return mailRegex.test(mail);
    }

    static async checkUserByMail(mail: string): Promise<boolean> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { mail } });
        return !!user;
    }
}

export default utilService;