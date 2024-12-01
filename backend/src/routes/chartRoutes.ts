import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import chartController from '../controllers/chartController';

const router = express.Router();

router.get('/chart/internships', verifyToken, chartController.getInternships);
router.get('/chart/years', verifyToken, chartController.getYears);
router.get('/chart/companies', verifyToken, chartController.getCompanies);

export default router;