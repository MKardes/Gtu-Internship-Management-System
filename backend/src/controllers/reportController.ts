import reportService from '../services/reportService';
import { Request, Response } from 'express';
import { logRequest } from '../utils/ResponseHandler';

const service = new reportService(); 

const createReport = async (req: any, res: Response) => {
    const result = await service.createReport(req.body, req.user);
    logRequest(res, result, 'POST /report', req);
}

export default { createReport };