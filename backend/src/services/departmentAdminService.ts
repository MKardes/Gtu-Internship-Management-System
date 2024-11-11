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
            const departmentName = departmentAdmin.department.department_name;
            const users = await userRepository
                .createQueryBuilder('user')
                .andWhere('user.role = :role', { role: 'User' })
                .getMany();
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
            if (!userData.full_name || userData.full_name.length <= 0)
                return { status: 400, data: { message: 'Geçersiz isim' } };
            if (!utilService.checkMail(userData.mail))
                return { status: 400, data: { message: 'Geçersiz mail' } };
            if (!utilService.checkPassword(userData.password))
                return { status: 400, data: { message: 'Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir' } };
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