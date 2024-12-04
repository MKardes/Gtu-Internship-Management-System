import dashboardService from '../services/dashboardService';
import { Request, Response } from 'express';

const service = new dashboardService();

const getStudents = async (req: Request, res: Response) => {
    const result = await service.getStudents(req.query.grade, req.query.semester);
    res.status(result.status).json(result.data);
}

const putInternshipState = async (req: Request, res: Response) => {
    const result = await service.putInternshipState(Number(req.params.id), req.body.state, req.body.is_sgk_uploaded);
    res.status(result.status).json(result.data);
}

export default { getStudents, putInternshipState };