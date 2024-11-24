import departmentAdminService from '../services/departmentAdminService';
import { Request, Response } from 'express';

const service = new departmentAdminService(); 

const getAllUsers = async (req: any, res: Response) => {
    const result = await service.getAllUsers(req.user);
    res.status(result.status).json(result.data);
}

const getDepartmentAdmin = async (req: any, res: Response) => {
    const result = await service.getDepartmentAdmin(req.user.id);
    res.status(result.status).json(result.data);
}

const createUser = async (req: Request, res: Response) => {
    const result = await service.createUser(req.body);
    res.status(result.status).json(result.data);
}

const deleteUser = async (req: Request, res: Response) => {
    const result = await service.deleteUser(req.params.id);
    res.status(result.status).json(result.data);
}

export default { getAllUsers, getDepartmentAdmin, createUser, deleteUser};