import express from 'express';
import {verifyToken} from '../middlewares/verifyToken';
import reportController from '../controllers/reportController';

const router = express.Router();


router.post('/report/create-report', verifyToken, reportController.createReport);
router.get('/reports', verifyToken, reportController.getReports);
router.delete('/report/:file', verifyToken, reportController.deleteReport);

export default router;