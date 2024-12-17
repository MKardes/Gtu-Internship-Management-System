import dashboardService from '../services/searchStudentService';
import { Request, Response } from 'express';
import { logRequest } from '../utils/ResponseHandler';

const service = new dashboardService();

const getStudents = async (req: Request, res: Response) => {
    const result = await service.getStudents(req.query.grade, req.query.semester);
    logRequest(res, result, 'GET /students', req);
}

const putInternshipState = async (req: Request, res: Response) => {
    const result = await service.putInternshipState(Number(req.params.id), req.body.state, req.body.is_sgk_uploaded);
    logRequest(res, result, `PUT /students/${req.params.id}/internship-state`, req);
}

export default { getStudents, putInternshipState };