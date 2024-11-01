// src/services/superAdminService.ts
import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

export class superAdminService {
    static async findUserByEmail(mail: string) {
        const userRepository = AppDataSource.getRepository(User);
        try {
            return await userRepository.findOneBy({ mail });
        } catch (error) {
            console.error('Kullanıcı bulunurken hata:', error);
            throw new Error('Kullanıcı bulunamadı');
        }
    }

    static async findDepartmentByName(department_name: string) {
        const departmentRepository = AppDataSource.getRepository(Department);
        try {
            return await departmentRepository.findOneBy({ department_name });
        } catch (error) {
            console.error('Departman bulunurken hata:', error);
            throw new Error('Departman bulunamadı');
        }
    }


    static async getAllUsers() {
        const userRepository = AppDataSource.getRepository(User);
        try {
            return await userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.department', 'department') // Kullanıcıya ait departmanı getir
                .getMany();
        } catch (error) {
            throw new Error('Kullanıcılar alınamadı');
        }
    }

    static async createUser(userData: any) {
        const userRepository = AppDataSource.getRepository(User);
        try {
            const newUser = userRepository.create(userData);
            return await userRepository.save(newUser);
        } catch (error) {
            console.error('Kullanıcı oluşturulurken hata:', error);
            throw new Error('Kullanıcı patladı');
        }
    }

    static async createDepartment(departmentData: any) {
        const departmentRepository = AppDataSource.getRepository(Department);
        try {
            const newDepartment = departmentRepository.create(departmentData);
            return await departmentRepository.save(newDepartment);
        } catch (error) {
            console.error('Departman oluşturulurken hata:', error);
            throw new Error('Departman oluşturulamadı');
        }
    }


    static async deleteDepartment(id: string) {
        const departmentRepository = AppDataSource.getRepository(Department);
        const userRepository = AppDataSource.getRepository(User);
        try {

            const department = await departmentRepository.findOneBy({ id });
            if (!department) {
                throw new Error('Departman bulunamadı');
            }

            // Departmana ait kullanıcıları sil
            const users = await userRepository.findBy({ department_id: id });
            if (users.length > 0) {
                await userRepository.remove(users);
            }
            // Departmanı sil
            return await departmentRepository.remove(department);
        } catch (error) {
            console.error('Departman silinirken hata:', error);
            throw new Error('Departman silinemedi');
        }
    }




    static async getAllDepartments() {
        const departmentRepository = AppDataSource.getRepository(Department);
        try {
            return await departmentRepository.find();
        } catch (error) {
            console.error('Departmanlar alınırken hata:', error);
            throw new Error('Departmanlar alınamadı');
        }
    }

    static async getDepartment(id: string) {
        const departmentRepository = AppDataSource.getRepository(Department);
        try {
            return await departmentRepository.findOneBy({ id });
        } catch (error) {
            console.error('Departman alınırken hata:', error);
            throw new Error('Departman alınamadı');
        }
    }

    static async deleteUser(id: string) {
        const userRepository = AppDataSource.getRepository(User);
        try {
            const user = await userRepository.findOneBy({ id });
            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }
            return await userRepository.remove(user);
        } catch (error) {
            console.error('Kullanıcı silinirken hata:', error);
            throw new Error('Kullanıcı silinemedi');
        }
    }
}

export default superAdminService;
