// src/utils/ResponseHandler.ts
import { Response } from 'express';
import Logger from './Logger'; // Aynı utils klasöründen import edilir

const logger = new Logger('response.log');

export const logRequest = (
    res: Response,
    result: { status: number; data: any },
    endpoint: string
) => {
    if (result.status >= 200 && result.status < 300) {
        logger.log(`${endpoint} - Success: Returned ${Array.isArray(result.data) ? result.data.length : 1} items.`);
    } else {
        logger.log(`${endpoint} - Failure: Status ${result.status}, Data: ${JSON.stringify(result.data)}`);
    }
    res.status(result.status).json(result.data);
};
