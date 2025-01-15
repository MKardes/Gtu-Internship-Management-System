// src/services/superAdminService.ts
import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import utilService from './utilService';
import bcrypt from 'bcrypt';
import { Internship } from '../entities/internship.entity';
import { Student } from '../entities/student.entity';

export class superAdminService {
    private internshipRepository = AppDataSource.getRepository(Internship);
    private studentRepository = AppDataSource.getRepository(Student);

    findDepartmentById(department_id: string) {
        const departmentRepository = AppDataSource.getRepository(Department);
        return departmentRepository.findOne({ where: { id: department_id } });
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
                .leftJoinAndSelect('user.department', 'department') // Include the related department
                .where('user.role = :role', { role: 'DepartmentAdmin' }) // Filter by role
                .getMany();
            return { status: 200, data: users };
            /*HİÇ USER YOKSA 404 MÜ DÖNMELİ ? boş array mi ? */
        } catch (error) {
            return { status: 500, data: { message: 'Kullanıcılar alınamadı' } }; // Error handling
        }
    }
    

    async createDepartmentAdmin(userData: any) {
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
                return { status: 409, data: { message: 'Bu e-posta adresi zaten kullanımda' } };
            if (!utilService.isValidDepartmentName(userData.department_name))
               return { status: 400, data: { message: 'Geçersiz departman adı' } };
            if (!await this.checkDepartmentByName(userData.department_name))
               return { status: 400, data: { message: 'Departman bulunamadı' } };
            const userRepository = AppDataSource.getRepository(User);
            const newUser = new User();
            newUser.full_name = userData.full_name;
            newUser.mail = userData.mail;
            newUser.password = await bcrypt.hash(userData.password, parseInt(process.env.SALT_ROUNDS));
            newUser.department = userData.department;
            newUser.role = userData.role;
            newUser.department = await this.findDepartmentById(userData.department_id);
            await userRepository.save(newUser);
            return { status: 201, data: newUser };
        } catch (error) {
            console.error(error);
            return { status: 500, data: { message: 'Kullanıcı oluşturulamadı' } };
        }
    }

    async createDepartment(departmentData: any) {
        const departmentRepository = AppDataSource.getRepository(Department);
        try {
            if (!utilService.isValidDepartmentName(departmentData.department_name))
                return { status: 400, data: { message: 'Geçersiz departman adı' } };
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

            const internships = await this.internshipRepository.createQueryBuilder('int')
                                .leftJoinAndSelect('int.student', "st")
                                .leftJoinAndSelect('st.department', "dp")
                                .where('dp.id = :dprtId', { dprtId: department.id })
                                .getMany();

            if (internships.length > 0){
                await this.internshipRepository.remove(internships);
            }
            
            const students = await this.studentRepository.createQueryBuilder('st')
                                .leftJoinAndSelect('st.department', "dp")
                                .where('dp.id = :dprtId', { dprtId: department.id })
                                .getMany();
            if (students.length > 0){
                await this.studentRepository.remove(students);
            }

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

    async getSuperAdmin(id: string) {
        const userRepository = AppDataSource.getRepository(User);
        try {
            const user = await userRepository.findOneBy({ id });
            return { status: 200, data: user };
        } catch (error) {
            return { status: 500, data: { message: 'Kullanıcı alınamadı' } };
        }
    }

}

export default superAdminService;
