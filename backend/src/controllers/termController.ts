import { Request, Response } from 'express';
import termService from '../services/termService';
import { logRequest } from '../utils/ResponseHandler';

const service = new termService();

const createTerm = async (req: Request, res: Response) => {
    const result = await service.createTerm(req.body);
    logRequest(res, result, 'POST /term', req);
}

const getTerms = async (req: Request, res: Response) => {
    const result = await service.getTerms();
    logRequest(res, result, 'GET /terms', req);
}

const getTermInternships = async (req: Request, res: Response) => {
    const result = await service.getTermInternships(req.query.year as string, req.query.company_id as string);
    logRequest(res, result, 'GET /term-internships', req);
}

export default { createTerm, getTerms, getTermInternships };