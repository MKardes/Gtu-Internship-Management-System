// src/controllers/superAdminController.ts
import superAdminService from '../services/superAdminService';
import { Request, Response } from 'express';


//CREATE
const createUser = async (req: Request, res: Response) => {
    try {
        const existingUser = await superAdminService.findUserByEmail(req.body.mail);
        if (existingUser)
        {
            console.log('Bu e-posta adresi zaten kullanımda');
            throw new Error('Bu e-posta adresi zaten kullanımda');
        }
        const newUser = await superAdminService.createUser(req.body);
        res.status(201).json(newUser); // Başarıyla oluşturulduğunda 201 döndür
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı oluşturulamadı', error: (error as Error).message }); // Hata mesajı döndürülür
    }
};

const createDepartment = async (req: Request, res: Response) => {
    try {
        const existingDepartment = await superAdminService.findDepartmentByName(req.body.department_name);
        if (existingDepartment)
            throw new Error('Bu departman zaten var');
        const newDepartment = await superAdminService.createDepartment(req.body);
        res.status(201).json(newDepartment);
    } catch (error) {
        res.status(500).json({ message: 'Departman oluşturulamadı', error: (error as Error).message });
    }
}
//CREATE


//DELETE
const deleteUser = async (req: Request, res: Response) => {
    try {
        const deletedUser = await superAdminService.deleteUser(req.params.id);
        res.status(200).json(deletedUser);
    } catch (error) {
        console.error('Kullanıcı silinemedi:', error);
        res.status(500).json({ message: 'Kullanıcı silinemedi', error: (error as Error).message });
    }
}

const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const deletedDepartment = await superAdminService.deleteDepartment(req.params.id);
        res.status(200).json(deletedDepartment);
    } catch (error) {
        console.error('Departman silinemedi:', error);
        res.status(500).json({ message: 'Departman silinemedi', error: (error as Error).message });
    }
}
//DELETE



//GET
const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await superAdminService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Yöneticiler alınamadı', error });
    }
};
const getAllDepartments = async (req: Request, res: Response) => {
    try {
        const departments = await superAdminService.getAllDepartments();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Departmanlar alınamadı', error });
    }
}

const getDepartment = async (req: Request, res: Response) => {
    try {
        const department = await superAdminService.getDepartment(req.params.id);
        res.json(department);
    } catch (error) {
        res.status(500).json({ message: 'Departman alınamadı', error });
    }
}
//GET



export default { getAllUsers, createUser, deleteUser, createDepartment, getAllDepartments, deleteDepartment, getDepartment };
