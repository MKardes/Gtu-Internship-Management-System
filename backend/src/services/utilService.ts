import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

export class utilService
{
    /*
        ^(?!.*['"%;]) : ' " % ; karakterlerini içeremez sql injectionda sık sık kullanılıyor
        (?=.*[a-z]) : en az bir küçük harf içermelidir
        (?=.*[A-Z]) : en az bir büyük harf içermelidir
        (?=.*\d) : en az bir rakam içermelidir
        .{8,} : en az 8 karakter olmalıdır
    */
    static isValidPassword(password: string) {
        const passwordRegex = /^(?!.*['"%`;])(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    static isValidRole(role: string) {
        return role === 'User' || role === 'DepartmentAdmin' || role === 'SuperAdmin';
    }

    static isValidMail(mail: string) {
        const mailRegex = /^(?!.*['"%`;]).*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
        return mailRegex.test(mail);
    }

    static isValidDepartmentName(department_name: string) {
        const departmentNameRegex = /^[a-zA-Z\s]{2,20}$/;
        return departmentNameRegex.test(department_name);
    }

    /*
        Verilen mail adresine sahip bir kullanıcı var mı yok mu kontrol eder
    */
    static async checkUserByMail(mail: string): Promise<boolean> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { mail } });
        return !!user;
    }

    static async checkDepartmentByName(department_name: string): Promise<boolean> {
        const departmentRepository = AppDataSource.getRepository(Department);
        const department = await departmentRepository.findOne({ where: { department_name } });
        return !!department;
    }

    /*
        /^[a-zA-Z]{3,20}$/ : 3-20 karakter arasında olmalıdır
    */
    static isValidName(name: string) {
        const nameRegex = /^[a-zA-Z\s]{3,20}$/;
        return nameRegex.test(name);
    }

    static async fetchUserById(id: string) {
        const userRepository = AppDataSource.getRepository(User);
        try {
            const user = await userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.department', 'department')
                .where('user.id = :id', { id })
                .getOne();
            return user;
        } catch (error) {
            throw new Error('Kullanıcı bilgileri alınırken bir hata oluştu');
        }
    }
}

export default utilService;