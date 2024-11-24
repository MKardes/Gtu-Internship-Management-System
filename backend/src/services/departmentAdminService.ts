import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/user.entity';
import utilService from './utilService';
import bcrypt from 'bcrypt';

export class departmentAdminService {
    // takes Department Admin Info in order to get Users belongs to the admin's Department 
    async getAllUsers(DepartmentAdminInfo: any) {

        try {
            const userRepository = AppDataSource.getRepository(User);
            const departmentAdmin = await userRepository.findOne(
                { where: { id: DepartmentAdminInfo.id }, relations: ['department'] }
            )
            if (!departmentAdmin)
                return { status: 500, data: { message: 'Bir hata oluştu' } };
            const departmentName = departmentAdmin.department.department_name;
            if (!departmentName)
                return { status: 500, data: { message: 'Bir hata oluştu' } };
            const users = await userRepository
                .createQueryBuilder('user')
                .where('department.department_name = :departmentName', { departmentName })
                .where('user.role = :role', { role: 'User' })
                .getMany();
            /*HİÇ USER YOKSA 404 MÜ DÖNMELİ ? boş array mi ? */
            return { status: 200, data: users };
        } catch (error) {
            return { status: 500, data: { message: 'Kullanıcılar alınamadı' } }; // Error handling
        }
    }

    async getDepartmentAdmin(id: string) {
        const userRepository = AppDataSource.getRepository(User);
        try {
            const user = await userRepository.findOne(
                { where: { id }, relations: ['department'] }
            );
            return { status: 200, data: user };
        } catch (error) {
            return { status: 500, data: { message: 'Kullanıcı alınamadı' } };
        }
    }

    async createUser(userData: any) {
        try {
            if (!utilService.isValidName(userData.full_name))
                return { status: 400, data: { message: 'Geçersiz isim' } };
            if (!utilService.isValidMail(userData.mail))
                return { status: 400, data: { message: 'Geçersiz mail' } };
            if (!utilService.isValidPassword(userData.password))
                return { status: 400, data: { message: 'Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir' } };
            if (!utilService.isValidRole(userData.role))
                return { status: 400, data: { message: 'Geçersiz rol' } };
            if (await utilService.checkUserByMail(userData.mail))
                return { status: 400, data: { message: 'Bu e-posta adresi zaten kullanımda' } };
            const userRepository = AppDataSource.getRepository(User);
            const newUser = new User();
            newUser.full_name = userData.full_name;
            newUser.mail = userData.mail;
            newUser.password = await bcrypt.hash(userData.password, parseInt(process.env.SALT_ROUNDS));
            newUser.department = userData.department;
            newUser.role = userData.role;
            await userRepository.save(newUser);
            return { status: 201, data: newUser };
        } catch (error) {
            console.error(error);
            return { status: 500, data: { message: 'Kullanıcı oluşturulamadı' } }; // Hata durumu
        }
    }

    async deleteUser(id: string) {
        const userRepository = AppDataSource.getRepository(User);
        try {
            const user = await userRepository.findOneBy({ id });
            if (!user)
                return { status: 404, data: { message: 'Kullanıcı bulunamadı' } };
            return { status: 200, data: await userRepository.remove(user) };
        } catch (error) {
            return { status: 500, data: { message: 'Kullanıcı silinemedi' } };
        }
    }
}

export default departmentAdminService;