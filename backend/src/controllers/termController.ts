import { Request, Response } from 'express';
import termService from '../services/termService';

const service = new termService();

const createTerm = async (req: Request, res: Response) => {
    const result = await service.createTerm(req.body);
    res.status(result.status).json(result.data);
}

const getTerms = async (req: Request, res: Response) => {
    const result = await service.getTerms();
    res.status(result.status).json(result.data);
}

export default { createTerm, getTerms};