import departmentAdminService from '../services/departmentAdminService';
import { Request, Response } from 'express';
import { logRequest } from '../utils/ResponseHandler'; // Loglama fonksiyonunu içe aktarıyoruz

const service = new departmentAdminService(); 

const getAllUsers = async (req: any, res: Response) => {
    const result = await service.getAllUsers(req.user);
    logRequest(res, result, 'GET /department-admin/users', req);
}

const getDepartmentAdmin = async (req: any, res: Response) => {
    const result = await service.getDepartmentAdmin(req.user.id);
    logRequest(res, result, 'GET /department-admin/admin', req);
}

const createUser = async (req: Request, res: Response) => {
    const result = await service.createUser(req.body);
    logRequest(res, result, 'POST /department-admin/user', req);
}

const deleteUser = async (req: Request, res: Response) => {
    const result = await service.deleteUser(req.params.id);
    logRequest(res, result, 'DELETE /department-admin/user/:id', req);
}

export default { getAllUsers, getDepartmentAdmin, createUser, deleteUser};