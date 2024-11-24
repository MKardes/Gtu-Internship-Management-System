import dashboardService from '../services/dashboardService';
import { Request, Response } from 'express';

const service = new dashboardService();

const getStudents = async (req: Request, res: Response) => {
    const result = await service.getStudents(req.query.grade, req.query.semester);
    res.status(result.status).json(result.data);
}

export default { getStudents };