// src/services/superAdminService.ts
import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

export class superAdminService {

    checkPassword(password: string) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    checkMail(mail: string) {
        const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return mailRegex.test(mail);
    }

    findDepartmentById(department_id: string) {
        const departmentRepository = AppDataSource.getRepository(Department);
        return departmentRepository.findOne({ where: { id: department_id } });
    }

    async checkUserByMail(mail: string): Promise<boolean> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { mail } });
        return !!user; // Kullanıcı mevcutsa true, değilse false döner.
    }
    
    async checkDepartmentByName(department_name: string): Promise<boolean> {
        const departmentRepository = AppDataSource.getRepository(Department);
        const department = await departmentRepository.findOne({ where: { department_name: department_name } });
        return !!department;
    }


    async leftJoinUserDepartment(user: User) {
        const userRepository = AppDataSource.getRepository(User);
    
        try {
            const userWithDepartment = await userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.department', 'department') // Departmanı dahil et
                .where('user.id = :id', { id: user.id }) // Kullanıcı ID'sine göre filtrele
                .getOne(); // Tek bir kullanıcı al
    
            return userWithDepartment || user; // Eğer departman ile birlikte kullanıcı bulunamazsa orijinal kullanıcıyı döndür
        } catch (error) {
            console.error(error);
            throw new Error('Departman bilgileri alınamadı');
        }
    }
    

    async getAllDepartmentAdmins() {
        const userRepository = AppDataSource.getRepository(User);
        try {
            const users = await userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.department', 'department') // Kullanıcıya ait departmanı getir
                .getMany();
            return { status: 200, data: users };
        } catch (error) {
            return { status: 500, data: { message: 'Kullanıcılar alınamadı' } }; // Hata durumu
        }
    }

    async createDepartmentAdmin(userData: any) {
        try {
            if (!userData.full_name || userData.full_name.length <= 0)
                return { status: 400, data: { message: 'Geçersiz isim' } };
            if (!this.checkMail(userData.mail)) 
                return { status: 400, data: { message: 'Geçersiz mail' } };
            if (!this.checkPassword(userData.password)) 
                return { status: 400, data: { message: 'Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir' } };
            if (await this.checkUserByMail(userData.mail)) 
                return { status: 400, data: { message: 'Bu e-posta adresi zaten kullanımda' } };
            const userRepository = AppDataSource.getRepository(User);
            const newUser = new User();
            newUser.full_name = userData.full_name;
            newUser.mail = userData.mail;
            newUser.password = userData.password;
            newUser.department = userData.department;
            newUser.role = userData.role;
            newUser.department = await this.findDepartmentById(userData.department_id);
            await userRepository.save(newUser);
            return { status: 201, data: newUser };
        } catch (error) {
            console.error(error); // Hata mesajını konsola yazdır
            return { status: 500, data: { message: 'Kullanıcı oluşturulamadı' } }; // Hata durumu
        }
    }

    async createDepartment(departmentData: any) {
        const departmentRepository = AppDataSource.getRepository(Department);
        try {
            if (!departmentData.department_name) 
                return { status: 400, data: { message: 'Departman adı boş olamaz' } };
            if (await this.checkDepartmentByName(departmentData.department_name)) 
                return { status : 409, data: { message: 'Departman zaten var' } };
            const newDepartment = new Department();
            newDepartment.department_name = departmentData.department_name;
            await departmentRepository.save(newDepartment);
            return { status: 201, data: newDepartment };
        } catch (error) {
            return { status: 500, data: { message: 'Departman oluşturulamadı' } };
        }
    }

    async deleteDepartment(id: string) {
        const departmentRepository = AppDataSource.getRepository(Department);
        const userRepository = AppDataSource.getRepository(User);
        try {

            const department = await departmentRepository.findOneBy({ id });
            if (!department)
                return { status: 404, data: { message: 'Departman bulunamadı' } };

            const users = await userRepository.createQueryBuilder('user')
                                    .where('user.department_id = :dptId', { dptId: department.id })
                                    .getMany();

            if (users.length > 0)// Departmana ait kullanıcıları sil
                await userRepository.remove(users);

            await departmentRepository.remove(department);// Departmanı sil

            return { status: 200, data: department };
        } catch (error) {
            return { status: 500, data: { message: 'Departman silinemedi' } };
        }
    }


    async getAllDepartments() {
        const departmentRepository = AppDataSource.getRepository(Department);
        try {
            const departments = await departmentRepository.find();
            return { status: 200, data: departments };
        } catch (error) {
            return { status: 500, data: { message: 'Departmanlar alınamadı' } };
        }
    }

    async getDepartment(id: string) {
        const departmentRepository = AppDataSource.getRepository(Department);
        try {
            const department = await departmentRepository.findOneBy({ id });
            return { status: 200, data: department };
        } catch (error) {
            return { status: 500, data: { message: 'Departman alınamadı' } };
        }
    }

    async deleteDepartmentAdmin(id: string) {
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

export default superAdminService;
