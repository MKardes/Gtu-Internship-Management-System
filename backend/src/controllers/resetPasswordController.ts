import resetPasswordService from '../services/resetPasswordService';
import { Request, Response } from 'express';
import { logRequest } from '../utils/ResponseHandler';

const service = new resetPasswordService();

const sendCode = async (req: Request, res: Response) => {
    const result = await service.sendCode(req.body.email);
    logRequest(res, result, 'POST /send-code', req);
}

const verifyCode = async (req: Request, res: Response) => {
    const result = await service.verifyCode(req.body.code, req.body.email);
    logRequest(res, result, 'POST /verify-code', req);
}

const changePassword = async (req: Request, res: Response) => {
    const result = await service.changePassword(req.body.password, req.body.email);
    logRequest(res, result, 'POST /change-password', req);
}

export default { sendCode, verifyCode, changePassword};