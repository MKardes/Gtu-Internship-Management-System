// src/controllers/superAdminController.ts
import superAdminService from '../services/superAdminService';
import { Request, Response } from 'express';
import { logRequest } from '../utils/ResponseHandler';

const service = new superAdminService(); 

//CREATE
const createDepartmentAdmin = async (req: Request, res: Response) => {
    const result = await service.createDepartmentAdmin(req.body);
    logRequest(res, result, 'POST /department-admin', req);
};


const createDepartment = async (req: Request, res: Response) => {
    const result = await service.createDepartment(req.body);
    logRequest(res, result, 'POST /department', req);
};
//CREATE


//DELETE
const deleteDepartmentAdmin = async (req: Request, res: Response) => {
    const result = await service.deleteDepartmentAdmin(req.params.id);
    logRequest(res, result, `DELETE /department-admin/${req.params.id}`, req);
}

const deleteDepartment = async (req: Request, res: Response) => {
    const result = await service.deleteDepartment(req.params.id);
    logRequest(res, result, `DELETE /department/${req.params.id}`, req);
}
//DELETE



//GET
const getAllDepartmentAdmins = async (req: Request, res: Response) => {
    const result = await service.getAllDepartmentAdmins();
    logRequest(res, result, 'GET /department-admins', req);
};

const getAllDepartments = async (req: Request, res: Response) => {
    const result = await service.getAllDepartments();
    logRequest(res, result, 'GET /departments', req);
}

const getDepartment = async (req: Request, res: Response) => {
    const result = await service.getDepartment(req.params.id);
    logRequest(res, result, `GET /department/${req.params.id}`, req);
}


const getSuperAdmin = async (req: any, res: Response) => {
    const result = await service.getSuperAdmin(req.user.id);
    logRequest(res, result, `GET /super-admin/${req.user.id}`, req);
}
//GET



export default { getAllDepartmentAdmins, createDepartmentAdmin, deleteDepartmentAdmin, createDepartment, getAllDepartments, deleteDepartment, getDepartment, getSuperAdmin};
