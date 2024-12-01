import chartService from '../services/chartService';
import { Request, Response } from 'express';

const service = new chartService();

const getInternships = async (req: Request, res: Response) => {
    const result = await service.getInternships(req.query.year as string, req.query.company_id as string);
    res.status(result.status).json(result.data);
}

const getYears = async (req: Request, res: Response) => {
    const result = await service.getYears();
    res.status(result.status).json(result.data);
}

const getCompanies = async (req: Request, res: Response) => {
    const result = await service.getCompanies();
    res.status(result.status).json(result.data);
}

export default { getInternships, getYears, getCompanies };