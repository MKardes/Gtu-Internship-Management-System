import chartService from '../services/chartService';
import { Request, Response } from 'express';
import { logRequest } from '../utils/ResponseHandler';

const service = new chartService();

const getInternshipChartDatas = async (req: Request, res: Response) => {
    const result = await service.getInternshipChartDatas(req.query.year as string, req.query.company_id as string);
    logRequest(res, result, 'GET /internships', req);
}

const getYears = async (req: Request, res: Response) => {
    const result = await service.getYears();
    logRequest(res, result, 'GET /years',req);
}

const getCompanies = async (req: Request, res: Response) => {
    const result = await service.getCompanies();
    logRequest(res, result, 'GET /companies',req);
}

export default { getInternshipChartDatas, getYears, getCompanies };