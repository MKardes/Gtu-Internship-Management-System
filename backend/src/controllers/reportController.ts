import reportService from '../services/reportService';
import { Request, Response } from 'express';
import { logRequest } from '../utils/ResponseHandler';

const service = new reportService(); 

const createReport = async (req: any, res: Response) => {
    const result = await service.createReport(req.body, req.user);
    logRequest(res, result, 'POST /report', req);
}

const getReports = async (req: any, res: Response) => {
    const result = await service.getReports(req.user);
    logRequest(res, result, 'GET /reports', req);
}

const deleteReport = async (req: any, res: Response) => {
    const result = await service.deleteReport(req.params.file);
    logRequest(res, result, 'DELETE /report', req);
}

export default { createReport, getReports, deleteReport };