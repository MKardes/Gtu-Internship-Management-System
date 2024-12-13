import reportService from '../services/reportService';
import { Request, Response } from 'express';
import { logRequest } from '../utils/ResponseHandler';

const service = new reportService(); 

const createReport = async (req: Request, res: Response) => {
    const result = await service.createReport(req.body);
    logRequest(res, result, 'POST /report', req);
}

export default { createReport };