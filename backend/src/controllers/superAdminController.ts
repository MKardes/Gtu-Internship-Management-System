// src/controllers/superAdminController.ts
import superAdminService from '../services/superAdminService';
import { Request, Response } from 'express';

const service = new superAdminService(); 

//CREATE
const createDepartmentAdmin = async (req: Request, res: Response) => {
    const result = await service.createDepartmentAdmin(req.body);
    res.status(result.status).json(result.data);
};


const createDepartment = async (req: Request, res: Response) => {
    const result = await service.createDepartment(req.body);
    res.status(result.status).json(result.data);
};
//CREATE


//DELETE
const deleteDepartmentAdmin = async (req: Request, res: Response) => {
    const result = await service.deleteDepartmentAdmin(req.params.id);
    res.status(result.status).json(result.data);
}

const deleteDepartment = async (req: Request, res: Response) => {
    const result = await service.deleteDepartment(req.params.id);
    res.status(result.status).json(result.data);
}
//DELETE



//GET
const getAllDepartmentAdmins = async (req: Request, res: Response) => {
    const result = await service.getAllDepartmentAdmins();
    res.status(result.status).json(result.data);
};

const getAllDepartments = async (req: Request, res: Response) => {
    const result = await service.getAllDepartments();
    res.status(result.status).json(result.data);
}

const getDepartment = async (req: Request, res: Response) => {
    const result = await service.getDepartment(req.params.id);
    res.status(result.status).json(result.data);
}
//GET



export default { getAllDepartmentAdmins, createDepartmentAdmin, deleteDepartmentAdmin, createDepartment, getAllDepartments, deleteDepartment, getDepartment };
