import chartService from '../services/chartService';
import { Request, Response } from 'express';
import Logger from '../utils/Logger';
import { logRequest } from '../utils/ResponseHandler';

const service = new chartService();
const logger = new Logger('response.log');

const getInternships = async (req: Request, res: Response) => {
    console.log(req.body)
    const result = await service.getInternships(req.query.year as string, req.query.company_id as string);
    logRequest(res, result, 'GET /internships');
}

const getYears = async (req: Request, res: Response) => {
    const result = await service.getYears();
    logRequest(res, result, 'GET /years');
}

const getCompanies = async (req: Request, res: Response) => {
    const result = await service.getCompanies();
    logRequest(res, result, 'GET /companies');
}

export default { getInternships, getYears, getCompanies };