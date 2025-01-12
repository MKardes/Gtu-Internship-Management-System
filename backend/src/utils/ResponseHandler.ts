import { Response, Request } from 'express';
import Logger from './Logger'; // Aynı utils klasöründen import edilir

interface MyRequest extends Request {
    user: any;
}
export const logger = new Logger('response.log');

export const logRequest = (
    res: Response, // request objesini parametre olarak alıyoruz
    result: { status: number; data: any },
    endpoint: string,
    req: Request,
) => {
    let myRequest: MyRequest = req as MyRequest;

    // Yanıt durumuna göre loglama
    if (result.status >= 200 && result.status < 300) {
        logger.log(`${endpoint} - Success: Returned ${Array.isArray(result.data) ? result.data.length : 1} items, User Id: ${JSON.stringify(myRequest.user?.id)}`);
    } else {
        logger.log(`${endpoint} - Failure: Status ${result.status}, Data: ${JSON.stringify(result.data)}`);
    }

    // Yanıtı gönderme
    res.status(result.status).json(result.data);
};

export const logBufferRequest = (
    res: Response, // request objesini parametre olarak alıyoruz
    result: { status: number; data: any; headers: any },
    endpoint: string,
    req: Request,
) => {
    let myRequest: MyRequest = req as MyRequest;

    // Yanıt durumuna göre loglama
    if (result.status >= 200 && result.status < 300) {
        logger.log(`${endpoint} - Success: Returned ${Array.isArray(result.data) ? result.data.length : 1} items, User Id: ${JSON.stringify(myRequest.user?.id)}`);
    } else {
        logger.log(`${endpoint} - Failure: Status ${result.status}, Data: ${JSON.stringify(result.data)}`);
    }

    // Yanıtı gönderme
    res.status(result.status).header(result.headers).send(result.data);
};