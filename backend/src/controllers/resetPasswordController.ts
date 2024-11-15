import resetPasswordService from '../services/resetPasswordService';
import { Request, Response } from 'express';

const service = new resetPasswordService();

const sendCode = async (req: Request, res: Response) => {
    const result = await service.sendCode(req.body.email);
    res.status(result.status).json(result.data);
}

const verifyCode = async (req: Request, res: Response) => {
    const result = await service.verifyCode(req.body.code, req.body.email);
    res.status(result.status).json(result.data);
}

const changePassword = async (req: Request, res: Response) => {
    const result = await service.changePassword(req.body.password, req.body.email);
    res.status(result.status).json(result.data);
}

export default { sendCode, verifyCode, changePassword};